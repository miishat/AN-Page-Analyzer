import { useState } from 'react';
import { DecodeMode, InputState } from '../types';

export const useInputState = () => {
    const [inputs, setInputs] = useState<InputState>({
        raw: { box1: '', box2: '' },
        base: { box1: '', box2: '' },
        next: { box1: '', box2: '' }
    });

    const [decodeMode, setDecodeMode] = useState<DecodeMode>('raw');

    const handleInputChange = (val: string, box: 'box1' | 'box2') => {
        // Only allow Hex characters
        if (/^[0-9a-fA-F]*$/.test(val)) {
            setInputs(prev => ({
                ...prev,
                [decodeMode]: {
                    ...prev[decodeMode],
                    [box]: val.toUpperCase()
                }
            }));
        }
    };

    const setInputDirectly = (val: string, box: 'box1' | 'box2' = 'box1', mode?: DecodeMode) => {
        const targetMode = mode || decodeMode;
        setInputs(prev => ({
            ...prev,
            [targetMode]: {
                ...prev[targetMode],
                [box]: val.toUpperCase()
            }
        }));
    };

    return {
        inputs,
        decodeMode,
        setDecodeMode,
        handleInputChange,
        setInputDirectly
    };
};
