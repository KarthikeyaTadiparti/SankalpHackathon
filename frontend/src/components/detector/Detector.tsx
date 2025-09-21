import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

interface DetectionResult {
  redirectCount: number;
  autoCheckedBoxes: string[];
  hiddenButtons: string[];
  confirmShaming: string[];
}

const Detector: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const url = queryParams.get("url") || "";

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const detect = async () => {
      if (!url) return;
      setLoading(true);
      setResult(null);
      setError("");

      try {
        const response = await axios.post("http://localhost:5000/api/detect", { url });
        setResult(response.data.result);
      } catch (err: any) {
        setError(err.response?.data?.error || "Server error");
      } finally {
        setLoading(false);
      }
    };

    detect();
  }, [url]);

  const renderList = (items: string[]) => (
    <ul className="list-disc ml-6 max-h-40 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      {items.map((item, index) => (
        <li key={index} className="text-sm break-words py-1">{item}</li>
      ))}
    </ul>
  );

  return (
    <div className="container mx-auto p-6 font-sans">
      <h1 className="text-4xl font-bold mb-8 text-center text-indigo-600">Dark UX Pattern Detector</h1>

      {!url && <p className="text-center text-gray-500">No URL provided.</p>}

      {loading && <p className="text-center text-gray-700 animate-pulse">Checking website...</p>}

      {error && <p className="text-center text-red-500 font-medium">{error}</p>}

      {result && (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Detection Results for <span className="text-indigo-600">{url}</span></h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            

            {/* Auto-checked boxes */}
            <div className="bg-green-50 p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-green-700 mb-2">Auto-checked Boxes <span className="text-gray-500 text-sm">({result.autoCheckedBoxes.length})</span></h3>
              {result.autoCheckedBoxes.length > 0 ? renderList(result.autoCheckedBoxes) : <p className="text-gray-500 text-sm">None found</p>}
            </div>

            

            {/* Confirm-shaming */}
            <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-yellow-700 mb-2">Confirm-shaming Text <span className="text-gray-500 text-sm">({result.confirmShaming.length})</span></h3>
              {result.confirmShaming.length > 0 ? renderList(result.confirmShaming) : <p className="text-gray-500 text-sm">None found</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detector;
