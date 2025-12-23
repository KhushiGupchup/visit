import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "../../utils/api.js";

export default function ScanQR() {
  const [result, setResult] = useState("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
    scanner.render(
      async (decodedText) => {
        setResult(decodedText);
        try {
          const res = await api.post("/security/scan", { qrPayload: decodedText });
          alert(res.data.msg);
        } catch (err) {
          alert(err.response?.data?.msg || "Error scanning QR");
        }
        scanner.clear();
      },
      (err) => console.log("Scanning...", err)
    );
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Scan QR Code</h1>
      <div id="qr-reader" className="w-full max-w-md mx-auto shadow"></div>
      <div className="mt-4 bg-gray-100 p-3 rounded">
        <strong>Result:</strong> {result || "No QR scanned yet"}
      </div>
    </div>
  );
}
