import { v4 } from "uuid";
import localForage from 'localforage';

export function createNewUUID (): string{
    return Buffer.from(v4()).toString('base64');
}

export async function getUUID (): Promise<string> {
    try {
        const uuid: string | null = await localForage.getItem('uuid');

        if (uuid) return uuid;
        else throw new Error();
    } catch (error) {
        let uuid = createNewUUID();

        await localForage.setItem('uuid', uuid);
        return uuid;
    }
}

export default {
    createNewUUID,
    getUUID,
}
