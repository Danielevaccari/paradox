import type { ProtobufKey } from "../../api/mirrorNode";

/** True when a mirror-node key is the server operator's public key (raw hex). */
export const isOperatorKey = (key: ProtobufKey | null | undefined, operatorPublicKey: string | null | undefined) =>
    Boolean(key?.key && operatorPublicKey && key.key.toLowerCase().endsWith(operatorPublicKey.toLowerCase()));
