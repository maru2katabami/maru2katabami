// hooks/useEncryption.js
import { useMemo } from "react";
import crypto from "crypto";

const useEncryption = (secretKey) => {
  const encrypt = (text) => {
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      crypto.createHash("sha256").update(secretKey).digest(),
      Buffer.alloc(16, 0) // Initialization vector (IV) - here, zeroed for simplicity
    );
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  };

  const decrypt = (encryptedText) => {
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      crypto.createHash("sha256").update(secretKey).digest(),
      Buffer.alloc(16, 0) // Same IV as encryption
    );
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  };

  return useMemo(() => ({ encrypt, decrypt }), [secretKey]);
};

export default useEncryption;
