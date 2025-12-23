import QRCode from "react-qr-code";

export default function QRCodeGenerator({ value }) {
  return (
    <div className="bg-white p-4 rounded shadow flex justify-center">
      <QRCode value={value} size={180} />
    </div>
  );
}
