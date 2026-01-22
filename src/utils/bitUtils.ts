/**
 * bitUtils.ts
 * 
 * Utility functions for hex-to-binary conversion and string formatting.
 * 
 * @author Mishat
 */

/**
 * Converts a single hex character to a 4-bit binary string.
 * @param char The hex character to convert.
 * @returns A 4-character string of '0's and '1's.
 */
export const hexCharToBinary = (char: string): string => {
    const intVal = parseInt(char, 16);
    if (isNaN(intVal)) return '';
    return intVal.toString(2).padStart(4, '0');
};

/**
 * Converts a full hex string to a binary string.
 * Ensures strict 4-bit representation per hex digit.
 * @param hex The full hex string.
 * @returns A binary string representing the hex input.
 */
export const hexToBinary = (hex: string): string => {
    const cleanHex = hex.replace(/[^0-9A-Fa-f]/g, '');
    let binary = '';
    for (const char of cleanHex) {
        binary += hexCharToBinary(char);
    }
    // Remove leading zeros if you wanted standard number parsing, 
    // but for a "Hex Viewer" preserving nibble alignment (4 bits per char) is usually better UX.
    // We keep the padding to ensure visual consistency with the input length.
    return binary;
};

/**
 * Formats a number with commas for display.
 * @param num The number to format.
 */
export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
}