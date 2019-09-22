import { encodeHex, decodeHex } from "orbs-client-sdk";
import { get } from "lodash";

export function serialize(value) {
    let serializedValue = value;
    let returnType;
    if (get(value, "__proto__.constructor.name") == "Uint8Array") {
        returnType = "Uint8Array";
        serializedValue = encodeHex(value);
    }

    return { returnType, value: serializedValue };
}

export function deserialize({ returnType, value }) {
    let deserializedValue = value;
    if (returnType == "Uint8Array") {
        deserializedValue = decodeHex(value);
    }

    return deserializedValue;
}