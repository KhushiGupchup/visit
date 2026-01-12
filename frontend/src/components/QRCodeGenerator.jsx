export default function QRCodeGenerator({ value }) {
  if (!value) return null;
  return (
    <div className="bg-white p-4 rounded shadow flex justify-center">
      <img src={value} alt="Visitor QR" width={180} height={180} />
    </div>
  );
}
