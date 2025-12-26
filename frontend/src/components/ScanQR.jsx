import { useEffect, useState, useContext, useRef } from "react";
//A library for scanning QR codes using the webcam
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "../utils/api.js";

import { AuthContext } from "../context/AuthContext.jsx";
import "../App.css";
import Topbar from "./Topbar.jsx";
import SidebarEmployee from "./EmployeeSidebar.jsx";

export default function ScanQR() {
  const [result, setResult] = useState(null);//(visitor info will store)
  const { logout } = useContext(AuthContext);
  const scannerRef = useRef(null);//Reference to the QR code scanner instance

  useEffect(() => {
    //Scanner Setup
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { height: 250 } },
      false
    );//fps:frame per second

    // call to api for successful scan with Text decoded from the QR code
    const onScanSuccess = async (decodedText) => {
      try {
        const res = await api.post("/security/scan", { qrPayload: decodedText });

        // Use the formatted log sent from backend
        setResult(res.data.log);

        alert(res.data.msg);

        // Pause scanner for 5 seconds
        scannerRef.current.clear().then(() => {
          setTimeout(() => {
            scannerRef.current.render(onScanSuccess, (err) => console.log("Scanning...", err));
            setResult(null); // clear previous visitor info
          }, 5000);
        });

      } catch (err) {
        alert(err.response?.data?.msg || "Error scanning QR");
        setResult(null);

        scannerRef.current.render(onScanSuccess, (err) => console.log("Scanning...", err));
      }
    };

    scannerRef.current.render(onScanSuccess, (err) => console.log("Scanning...", err));

    return () => {
      scannerRef.current.clear().catch((e) => console.log("Scanner cleanup error", e));
    };
  }, []);

  return (
   <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
         <SidebarEmployee/>
   
         {/* MAIN CONTENT AREA */}
         <div className="flex-1 flex flex-col overflow-auto pt-[144px] md:pt-20 md:ml-64">
   
           {/*  Topbar Added Here */}
           <Topbar />
        <h1 className="text-3xl font-extrabold mb-8 text-gray-800 text-center md:text-left mt-3 p-2">
          Scan QR Code
        </h1>
    {/*Renders a QR scanner on the page */}
        <div className="flex justify-center mb-8">
          <div
            id="qr-reader"
            className="w-full max-w-lg p-12 bg-white shadow-lg rounded-lg"
          ></div>
        </div>
        {/*Here the info of visitor will be show*/}
        <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6 text-center transition-all duration-300">
          {!result ? (
            <span className="text-gray-500 text-lg">No QR scanned yet</span>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Visitor Info</h2>
              <p className="text-gray-800 text-lg mb-2">
                <span className="font-medium">Name:</span> {result?.name || "-"}
              </p>
              <p className="text-gray-800 text-lg">
                <span className="font-medium">Email:</span> {result?.email || "-"}
              </p>
              <p className="text-gray-500 text-sm mt-2">Ready for next scan in 5 seconds...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

