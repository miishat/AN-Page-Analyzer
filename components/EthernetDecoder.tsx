import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, ArrowLeftRight, Minus, ArrowDownUp, Info } from 'lucide-react';

interface EthernetDecoderProps {
    hexString: string;
    hexString2?: string;
    mode: 'base' | 'next';
}

// --- Data Structures & Helpers ---

interface BasePageData {
    selector: number;
    echoedNonce: number;
    txNonce: number;
    pause: boolean;
    asmPause: boolean;
    ack2: boolean; // D12, usually Reserved, but mapped to ACK2 in some structs
    rf: boolean;
    ack: boolean;
    np: boolean;
    f0: boolean;
    f1: boolean;
    f2: boolean;
    f3: boolean;
    f4: boolean;
    activeTechs: { name: string; bit: number }[];
}

interface NextPageData {
    isMessagePage: boolean;
    messageCode: number;
    unformattedCode: number;
    toggle: boolean;
    ack2: boolean;
    ack: boolean;
    nextNP: boolean;
    upperData: bigint;
}

const getBit = (val: bigint, index: number): boolean => ((val >> BigInt(index)) & 1n) === 1n;
const getBits = (val: bigint, start: number, end: number): number => {
    const length = BigInt(end - start + 1);
    const mask = (1n << length) - 1n;
    const shift = BigInt(start);
    return Number((val >> shift) & mask);
};

// Updated Tech Map to match provided struct names more closely
const techMap: Record<number, string> = {
    0: '1000BASE-KX',
    1: '10GBASE-KX4',
    2: '10GBASE-KR',
    3: '40GBASE-KR4',
    4: '40GBASE-CR4',
    5: '100GBASE-CR10',
    6: '100GBASE-KP4',
    7: '100GBASE-KR4',
    8: '100GBASE-CR4',
    9: '25GBASE-R_S (KR-S/CR-S)',
    10: '25GBASE-R (KR/CR)',
    11: '2500BASE-KX',
    12: '5GBASE-KR',
    13: '50GBASE-R',
    14: '100GBASE-R2',
    15: '200GBASE-R4',
    16: '100GBASE-R1',
    17: '200GBASE-R2',
    18: '400GBASE-R4',
};

const parseBasePage = (hex: string): BasePageData => {
    const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
    const val = BigInt('0x' + (cleanHex || '0'));

    const techAbility = getBits(val, 21, 42);
    const activeTechs = [];
    for (let i = 0; i < 22; i++) {
        if ((BigInt(techAbility) >> BigInt(i)) & 1n) {
            activeTechs.push({
                name: techMap[i] || `Reserved (Bit ${i})`,
                bit: 21 + i
            });
        }
    }

    return {
        selector: getBits(val, 0, 4),
        echoedNonce: getBits(val, 5, 9),
        txNonce: getBits(val, 16, 20),
        pause: getBit(val, 10),
        asmPause: getBit(val, 11),
        ack2: getBit(val, 12), // Extracting D12
        rf: getBit(val, 13),
        ack: getBit(val, 14),
        np: getBit(val, 15),
        f0: getBit(val, 43), // 10G/lane FEC Ability
        f1: getBit(val, 44), // 10G/lane FEC Req
        f2: getBit(val, 45), // 25G RS-FEC Req
        f3: getBit(val, 46), // 25G BASE-R FEC Req (Firecode)
        f4: getBit(val, 47), // 100G RS-FEC-Int Req
        activeTechs
    };
};

const parseNextPage = (hex: string): NextPageData => {
    const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
    const val = BigInt('0x' + (cleanHex || '0'));

    return {
        isMessagePage: getBit(val, 13),
        messageCode: getBits(val, 0, 10),
        unformattedCode: getBits(val, 0, 10),
        toggle: getBit(val, 11),
        ack2: getBit(val, 12),
        ack: getBit(val, 14),
        nextNP: getBit(val, 15),
        upperData: BigInt('0x' + (cleanHex || '0')) >> 16n
    };
};

const getMessageDescription = (code: number) => {
    switch (code) {
        case 1: return "Null Message";
        case 2: return "Technology Ability and FEC Extension";
        case 3: return "Remote Fault";
        case 4: return "Max TAF";
        case 5: return "Organizationally Unique Identifier Tagged Message (OUI)";
        case 6: return "AN device Identifier Tag Code";
        case 10: return "EEE Technology Message Code";
        default: return "Reserved / User Defined";
    }
}

// Helper to decode Extended Tech Ability (Message Code 2)
// Mapping U0..U31 (bits of upperData, corresponding to D16..D47)
const getExtendedTechs = (upperData: bigint) => {
    const techs: { id: string, name: string, bit: number }[] = [];
    const check = (n: number) => ((upperData >> BigInt(n)) & 1n) === 1n;

    if (check(0)) techs.push({ id: 'U0', name: '200GBASE-KR1 or 200GBASE-CR1', bit: 16 });
    if (check(1)) techs.push({ id: 'U1', name: '400GBASE-KR2 or 400GBASE-CR2', bit: 17 });
    if (check(2)) techs.push({ id: 'U2', name: '800GBASE-KR4 or 800GBASE-CR4', bit: 18 });
    if (check(3)) techs.push({ id: 'U3', name: '1.6TBASE-KR8 or 1.6TBASE-CR8', bit: 19 });

    // U4-U27 Reserved
    for (let i = 4; i <= 27; i++) {
        if (check(i)) techs.push({ id: `U${i}`, name: 'Reserved', bit: 16 + i });
    }

    // U28-U31 Extended FEC
    for (let i = 28; i <= 31; i++) {
        if (check(i)) techs.push({ id: `U${i}`, name: 'Extended FEC Ability (Reserved)', bit: 16 + i });
    }

    return techs;
}

// --- Main Component ---

const EthernetDecoder: React.FC<EthernetDecoderProps> = ({ hexString, hexString2, mode }) => {

    // === RENDER COMPARISON VIEW ===
    if (hexString2) {
        if (mode === 'base') {
            const d1 = parseBasePage(hexString);
            const d2 = parseBasePage(hexString2);

            // Merge unique techs for comparison
            const allTechsMap = new Map<number, string>();
            d1.activeTechs.forEach(t => allTechsMap.set(t.bit, t.name));
            d2.activeTechs.forEach(t => allTechsMap.set(t.bit, t.name));
            const allTechs = Array.from(allTechsMap.entries()).sort((a, b) => a[0] - b[0]);

            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Nonce Cross-Check */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                        <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <ArrowDownUp className="w-4 h-4" /> Link Partner Nonce Check
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                                <div className="text-xs text-slate-500 mb-2 font-medium uppercase">Input 1 Rx (Echo) vs Input 2 Tx</div>
                                <div className="flex items-center justify-between">
                                    <div className="font-mono text-sm">
                                        <span className="text-slate-400 mr-2">1.Echo:</span>
                                        {d1.echoedNonce.toString(2).padStart(5, '0')}
                                    </div>
                                    <ArrowRight className={`w-4 h-4 ${d1.echoedNonce === d2.txNonce ? 'text-emerald-500' : 'text-red-500'}`} />
                                    <div className="font-mono text-sm">
                                        <span className="text-slate-400 mr-2">2.Tx:</span>
                                        {d2.txNonce.toString(2).padStart(5, '0')}
                                    </div>
                                </div>
                                {d1.echoedNonce !== d2.txNonce && (
                                    <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Mismatch
                                    </div>
                                )}
                            </div>

                            <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                                <div className="text-xs text-slate-500 mb-2 font-medium uppercase">Input 2 Rx (Echo) vs Input 1 Tx</div>
                                <div className="flex items-center justify-between">
                                    <div className="font-mono text-sm">
                                        <span className="text-slate-400 mr-2">2.Echo:</span>
                                        {d2.echoedNonce.toString(2).padStart(5, '0')}
                                    </div>
                                    <ArrowRight className={`w-4 h-4 ${d2.echoedNonce === d1.txNonce ? 'text-emerald-500' : 'text-red-500'}`} />
                                    <div className="font-mono text-sm">
                                        <span className="text-slate-400 mr-2">1.Tx:</span>
                                        {d1.txNonce.toString(2).padStart(5, '0')}
                                    </div>
                                </div>
                                {d2.echoedNonce !== d1.txNonce && (
                                    <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Mismatch
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Control & Status Comparison */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Control & Status Comparison</h3>
                        <div className="space-y-3">
                            <CompareRow label="Selector Field" val1={`0x${d1.selector.toString(16).toUpperCase()}`} val2={`0x${d2.selector.toString(16).toUpperCase()}`} bitRange="0:4" />
                            <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
                            <CompareBoolRow label="Remote Fault (RF)" val1={d1.rf} val2={d2.rf} bitIndex={13} />
                            <CompareBoolRow label="Acknowledge (ACK)" val1={d1.ack} val2={d2.ack} bitIndex={14} />
                            <CompareBoolRow label="Next Page (NP)" val1={d1.np} val2={d2.np} bitIndex={15} />
                            <CompareBoolRow label="Pause Ability" val1={d1.pause} val2={d2.pause} bitIndex={10} />
                            <CompareBoolRow label="ASM Pause" val1={d1.asmPause} val2={d2.asmPause} bitIndex={11} />
                            <CompareBoolRow label="ACK2 / Reserved" val1={d1.ack2} val2={d2.ack2} bitIndex={12} />
                        </div>
                    </div>

                    {/* FEC Comparison */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">FEC Comparison</h3>
                        <div className="space-y-3">
                            <CompareBoolRow label="10G/lane FEC Ability (F0)" val1={d1.f0} val2={d2.f0} bitIndex={43} />
                            <CompareBoolRow label="10G/lane FEC Req (F1)" val1={d1.f1} val2={d2.f1} bitIndex={44} />
                            <CompareBoolRow label="25G RS-FEC Req (F2)" val1={d1.f2} val2={d2.f2} bitIndex={45} />
                            <CompareBoolRow label="25G BASE-R FEC Req (F3)" val1={d1.f3} val2={d2.f3} bitIndex={46} />
                            <CompareBoolRow label="100G RS-FEC-Int Req (F4)" val1={d1.f4} val2={d2.f4} bitIndex={47} />
                        </div>
                    </div>

                    {/* Tech Comparison */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Technology Ability Comparison <span className="text-[10px] ml-1 opacity-50 font-mono">D[21:42]</span></h3>
                        {allTechs.length === 0 ? <div className="text-slate-400 italic">No technologies advertised</div> : (
                            <div className="grid grid-cols-1 gap-2">
                                {allTechs.map(([bit, name]) => {
                                    const has1 = d1.activeTechs.some(t => t.bit === bit);
                                    const has2 = d2.activeTechs.some(t => t.bit === bit);
                                    const match = has1 === has2;
                                    return (
                                        <div key={bit} className={`flex items-center justify-between p-2 rounded-lg text-sm border ${match ? 'border-transparent' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'}`}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">D{bit}</span>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{name}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className="text-[10px] text-slate-400 font-mono">1</span>
                                                    {has1 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Minus className="w-4 h-4 text-slate-300" />}
                                                </div>
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className="text-[10px] text-slate-400 font-mono">2</span>
                                                    {has2 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Minus className="w-4 h-4 text-slate-300" />}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (mode === 'next') {
            const d1 = parseNextPage(hexString);
            const d2 = parseNextPage(hexString2);

            // Extended Tech Parsing
            const extTechs1 = (d1.isMessagePage && d1.messageCode === 2) ? getExtendedTechs(d1.upperData) : [];
            const extTechs2 = (d2.isMessagePage && d2.messageCode === 2) ? getExtendedTechs(d2.upperData) : [];

            // Merge for comparison
            const allExtTechsMap = new Map<string, { id: string, name: string, bit: number }>();
            extTechs1.forEach(t => allExtTechsMap.set(t.id, t));
            extTechs2.forEach(t => allExtTechsMap.set(t.id, t));
            const allExtTechs = Array.from(allExtTechsMap.values()).sort((a, b) => a.bit - b.bit);

            return (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Next Page Comparison</h3>
                        <div className="space-y-3">
                            <CompareBoolRow label="Message Page (MP)" val1={d1.isMessagePage} val2={d2.isMessagePage} bitIndex={13} />
                            <CompareBoolRow label="Next Page (NP)" val1={d1.nextNP} val2={d2.nextNP} bitIndex={15} />
                            <CompareBoolRow label="Acknowledge (ACK)" val1={d1.ack} val2={d2.ack} bitIndex={14} />
                            <CompareBoolRow label="Ack 2 (ACK2)" val1={d1.ack2} val2={d2.ack2} bitIndex={12} />
                            <CompareBoolRow label="Toggle (T)" val1={d1.toggle} val2={d2.toggle} bitIndex={11} />
                            <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />

                            {/* If both are Message Pages, compare codes */}
                            {d1.isMessagePage && d2.isMessagePage && (
                                <CompareRow
                                    label="Message Code"
                                    val1={`0x${d1.messageCode.toString(16).toUpperCase()} (${getMessageDescription(d1.messageCode)})`}
                                    val2={`0x${d2.messageCode.toString(16).toUpperCase()} (${getMessageDescription(d2.messageCode)})`}
                                    bitRange="0:10"
                                />
                            )}
                            {/* If both Unformatted */}
                            {!d1.isMessagePage && !d2.isMessagePage && (
                                <CompareRow label="Unformatted Code" val1={`0x${d1.unformattedCode.toString(16).toUpperCase()}`} val2={`0x${d2.unformattedCode.toString(16).toUpperCase()}`} bitRange="0:10" />
                            )}
                            {/* Mixed */}
                            {d1.isMessagePage !== d2.isMessagePage && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 text-sm rounded-lg flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Page types differ (Message vs Unformatted)
                                </div>
                            )}

                            <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />

                            {/* Special handling for Message Code 2 vs Generic Upper Data */}
                            {(d1.messageCode === 2 || d2.messageCode === 2) ? (
                                <div className="mt-4">
                                    <h4 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">Extended Technologies</h4>
                                    {allExtTechs.length === 0 ? <div className="text-slate-400 italic text-xs">No extended technologies advertised</div> : (
                                        <div className="grid grid-cols-1 gap-2">
                                            {allExtTechs.map((tech) => {
                                                const has1 = extTechs1.some(t => t.id === tech.id);
                                                const has2 = extTechs2.some(t => t.id === tech.id);
                                                const match = has1 === has2;
                                                return (
                                                    <div key={tech.id} className={`flex items-center justify-between p-2 rounded-lg text-sm border ${match ? 'border-transparent' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'}`}>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">D{tech.bit}</span>
                                                            <span className="font-medium text-slate-700 dark:text-slate-300">{tech.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <span className="text-[9px] text-slate-400 font-mono">1</span>
                                                                {d1.messageCode === 2 ? (has1 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Minus className="w-4 h-4 text-slate-300" />) : <span className="text-[9px] text-slate-300">N/A</span>}
                                                            </div>
                                                            <div className="flex flex-col items-center gap-0.5">
                                                                <span className="text-[9px] text-slate-400 font-mono">2</span>
                                                                {d2.messageCode === 2 ? (has2 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Minus className="w-4 h-4 text-slate-300" />) : <span className="text-[9px] text-slate-300">N/A</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <CompareRow label="Upper Data (D47:16)" val1={`0x${d1.upperData.toString(16).toUpperCase()}`} val2={`0x${d2.upperData.toString(16).toUpperCase()}`} bitRange="16:47" />
                            )}
                        </div>
                    </div>
                </div>
            )
        }
    }

    // === RENDER SINGLE VIEW ===
    if (mode === 'base') {
        const d = parseBasePage(hexString);
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Control & Status</h3>
                        <div className="space-y-2">
                            <StatusRow label="Selector Field" bitRange="0:4" value={`0x${d.selector.toString(16).toUpperCase()}`} desc={d.selector === 1 ? 'IEEE 802.3' : 'Unknown Standard'} />
                            <StatusRow label="Remote Fault (RF)" bitIndex={13} value={d.rf ? 'Fault Detected' : 'No Fault'} active={d.rf} isBoolean />
                            <StatusRow label="Acknowledge (ACK)" bitIndex={14} value={d.ack ? 'Active' : 'Inactive'} active={d.ack} isBoolean />
                            <StatusRow label="Next Page (NP)" bitIndex={15} value={d.np ? 'Requested' : 'None'} active={d.np} isBoolean />
                            <StatusRow label="ACK2 / Reserved" bitIndex={12} value={d.ack2 ? '1' : '0'} active={d.ack2} isBoolean />
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Capabilities & FEC</h3>
                        <div className="space-y-2">
                            <StatusRow label="Pause Ability" bitRange="10:11" value={d.pause ? 'Supported' : 'No'} active={d.pause} isBoolean />
                            <StatusRow label="ASM Pause" bitIndex={11} value={d.asmPause ? 'Supported' : 'No'} active={d.asmPause} isBoolean />
                            <div className="border-t border-slate-200 dark:border-slate-700 my-2 pt-2"></div>
                            <StatusRow label="10G/lane FEC Ability (F0)" bitIndex={43} value={d.f0 ? 'Supported' : 'No'} active={d.f0} isBoolean />
                            <StatusRow label="10G/lane FEC Req (F1)" bitIndex={44} value={d.f1 ? 'Yes' : 'No'} active={d.f1} isBoolean />
                            <StatusRow label="25G RS-FEC Req (F2)" bitIndex={45} value={d.f2 ? 'Yes' : 'No'} active={d.f2} isBoolean />
                            <StatusRow label="25G BASE-R FEC Req (F3)" bitIndex={46} value={d.f3 ? 'Yes' : 'No'} active={d.f3} isBoolean />
                            <StatusRow label="100G RS-FEC-Int Req (F4)" bitIndex={47} value={d.f4 ? 'Yes' : 'No'} active={d.f4} isBoolean />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Technology Ability <span className="text-[10px] ml-1 opacity-50 font-mono">D[21:42]</span></h3>
                    {d.activeTechs.length === 0 ? (
                        <div className="text-slate-400 italic text-sm py-2">No technologies advertised</div>
                    ) : (
                        <ul className="space-y-2">
                            {d.activeTechs.map((tech, idx) => (
                                <li key={idx} className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        {tech.name}
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">D{tech.bit}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Nonces</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-slate-400">Echoed (Rx)</span>
                                    <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">D[5:9]</span>
                                </div>
                                <div className="font-mono text-sm">{d.echoedNonce.toString(2).padStart(5, '0')}</div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-slate-400">Transmitted (Tx)</span>
                                    <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">D[16:20]</span>
                                </div>
                                <div className="font-mono text-sm">{d.txNonce.toString(2).padStart(5, '0')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'next') {
        const d = parseNextPage(hexString);
        const extendedTechs = (d.isMessagePage && d.messageCode === 2) ? getExtendedTechs(d.upperData) : [];

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Page Type <span className="text-[10px] ml-1 opacity-50 font-mono">D[13]</span></h3>
                        <div className="flex items-center gap-2 text-lg font-medium text-slate-800 dark:text-slate-200">
                            <ArrowRight className="w-5 h-5 text-indigo-500" />
                            {d.isMessagePage ? "Message Page" : "Unformatted Page"}
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Flags</h3>
                        <div className="space-y-2">
                            <StatusRow label="Next Page (NP)" bitIndex={15} value={d.nextNP ? 'More Pages' : 'Last Page'} active={d.nextNP} isBoolean />
                            <StatusRow label="Acknowledge (ACK)" bitIndex={14} value={d.ack ? 'Yes' : 'No'} active={d.ack} isBoolean />
                            <StatusRow label="Message Page (MP)" bitIndex={13} value={d.isMessagePage ? 'Yes' : 'No'} active={d.isMessagePage} isBoolean />
                            <StatusRow label="Ack 2 (ACK2)" bitIndex={12} value={d.ack2 ? 'Yes' : 'No'} active={d.ack2} isBoolean />
                            <StatusRow label="Toggle (T)" bitIndex={11} value={d.toggle ? '1' : '0'} active={true} />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Payload</h3>
                    {d.isMessagePage ? (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-slate-400">Message Code Field</div>
                                <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 rounded">D[0:10]</span>
                            </div>
                            <div className="text-2xl font-mono text-indigo-600 dark:text-indigo-400">
                                0x{d.messageCode.toString(16).toUpperCase()}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                {getMessageDescription(Number(d.messageCode))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-slate-400">Unformatted Data (Lower 11)</div>
                                <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 rounded">D[0:10]</span>
                            </div>
                            <div className="text-xl font-mono">0x{d.unformattedCode.toString(16).toUpperCase()}</div>
                        </div>
                    )}

                    {/* Special Handling for Message Code 2 */}
                    {d.isMessagePage && d.messageCode === 2 ? (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-3">
                                <div className="text-xs text-slate-400">Extended Technology Ability</div>
                                <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 rounded">D[16:47]</span>
                            </div>
                            {extendedTechs.length === 0 ? (
                                <div className="text-sm text-slate-500 italic">No extended technologies advertised</div>
                            ) : (
                                <ul className="space-y-2">
                                    {extendedTechs.map((tech) => (
                                        <li key={tech.id} className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                {tech.name}
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">D{tech.bit}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="mt-3 pt-2 text-[10px] text-slate-400 font-mono text-right border-t border-slate-100 dark:border-slate-800">
                                Raw: 0x{d.upperData.toString(16).toUpperCase()}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-1">
                                <div className="text-xs text-slate-400">Upper 32-bits Data</div>
                                <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 rounded">D[16:47]</span>
                            </div>
                            <div className="font-mono break-all text-sm">0x{d.upperData.toString(16).toUpperCase()}</div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

// --- Sub-components ---

interface StatusRowProps {
    label: string;
    value: string | number;
    desc?: string;
    active?: boolean;
    isBoolean?: boolean;
    bitIndex?: number;
    bitRange?: string;
}

const StatusRow = ({ label, value, desc, active, isBoolean, bitIndex, bitRange }: StatusRowProps) => (
    <div className="flex justify-between items-center text-sm group">
        <div className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400">{label}</span>
            {(bitIndex !== undefined || bitRange) && (
                <span className="text-[9px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded opacity-70 group-hover:opacity-100 transition-opacity">
                    D{bitIndex !== undefined ? bitIndex : bitRange}
                </span>
            )}
        </div>
        <div className="flex items-center gap-2">
            <span className={`font-medium ${isBoolean ? (active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400') : 'text-slate-900 dark:text-slate-100'}`}>
                {value}
            </span>
            {desc && <span className="text-xs text-slate-400">({desc})</span>}
        </div>
    </div>
);

const CompareRow = ({ label, val1, val2, bitIndex, bitRange }: { label: string, val1: string, val2: string, bitIndex?: number, bitRange?: string }) => {
    const isDiff = val1 !== val2;
    return (
        <div className={`flex items-center justify-between text-sm p-1.5 rounded ${isDiff ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800' : ''}`}>
            <div className="flex items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400">{label}</span>
                {(bitIndex !== undefined || bitRange) && (
                    <span className="text-[9px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded opacity-70">
                        D{bitIndex !== undefined ? bitIndex : bitRange}
                    </span>
                )}
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
                <div className={`flex flex-col items-end ${isDiff ? 'text-amber-700 dark:text-amber-300' : 'text-slate-500'}`}>
                    <span className="text-[9px] opacity-50">1</span>
                    {val1}
                </div>
                <div className={`flex flex-col items-end ${isDiff ? 'text-amber-700 dark:text-amber-300' : 'text-slate-500'}`}>
                    <span className="text-[9px] opacity-50">2</span>
                    {val2}
                </div>
            </div>
        </div>
    )
}

const CompareBoolRow = ({ label, val1, val2, bitIndex }: { label: string, val1: boolean, val2: boolean, bitIndex: number }) => {
    const isDiff = val1 !== val2;
    return (
        <div className={`flex items-center justify-between text-sm p-1.5 rounded ${isDiff ? 'bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800' : ''}`}>
            <div className="flex items-center gap-2">
                <span className="text-slate-600 dark:text-slate-400">{label}</span>
                <span className="text-[9px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded opacity-70">
                    D{bitIndex}
                </span>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] text-slate-400 font-mono">1</span>
                    {val1 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Minus className="w-4 h-4 text-slate-300" />}
                </div>
                <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] text-slate-400 font-mono">2</span>
                    {val2 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Minus className="w-4 h-4 text-slate-300" />}
                </div>
            </div>
        </div>
    )
}

export default EthernetDecoder;