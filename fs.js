import fs from 'fs/promises';

export async function exists(filename) {
    try {
        await fs.access(filename);
        return true;
    } catch {
        return false;
    }
}
