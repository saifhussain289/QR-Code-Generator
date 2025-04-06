import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function App() {
  const [inputValue, setInputValue] = useState<string>('');
  const [qrValue, setQrValue] = useState<string>('');
  const [qrSize, setQrSize] = useState<number>(256);
  const [qrBgColor, setQrBgColor] = useState<string>('#FFFFFF');
  const [qrFgColor, setQrFgColor] = useState<string>('#000000');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isUrl, setIsUrl] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<string>('');
  const qrRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValidUrl = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleGenerateQR = () => {
    if (!inputValue.trim()) {
      setErrorMessage('Please enter some text or a number');
      return;
    }

    setErrorMessage('');
    setQrValue(inputValue);
    setIsUrl(isValidUrl(inputValue));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    setCopySuccess('');
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGenerateQR();
    }
  };

  const downloadQRCode = () => {
    if (qrRef.current) {
      const svgElement = qrRef.current.querySelector('svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          canvas.width = qrSize;
          canvas.height = qrSize;
          ctx?.drawImage(img, 0, 0);
          const a = document.createElement('a');
          a.download = 'qrcode.png';
          a.href = canvas.toDataURL('image/png');
          a.click();
        };
        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
      }
    }
  };

  const copyToClipboard = () => {
    if (inputValue) {
      navigator.clipboard.writeText(inputValue).then(
        () => {
          setCopySuccess('Copied!');
          setTimeout(() => setCopySuccess(''), 2000);
        },
        (err) => {
          console.error('Could not copy text: ', err);
        }
      );
    }
  };

  const clearQrCode = () => {
    setQrValue('');
    setInputValue('');
    setErrorMessage('');
    setCopySuccess('');
    setIsUrl(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">QR Code Generator</h1>

        <div className="mb-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <div className="flex-grow">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter text or number to generate QR code"
                className={`w-full rounded-lg border p-3 focus:outline-none focus:ring-2 ${
                  errorMessage ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
              />
              {errorMessage && (
                <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
              )}
            </div>
            <button
              onClick={handleGenerateQR}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
            >
              Generate QR
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="mb-3 text-xl font-semibold text-gray-700">Customize QR Code</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Size (px)</label>
              <input
                type="range"
                min="128"
                max="512"
                step="8"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="mt-1 text-sm text-gray-500">{qrSize}px</div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Background Color</label>
              <input
                type="color"
                value={qrBgColor}
                onChange={(e) => setQrBgColor(e.target.value)}
                className="h-10 w-full rounded border border-gray-300"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Foreground Color</label>
              <input
                type="color"
                value={qrFgColor}
                onChange={(e) => setQrFgColor(e.target.value)}
                className="h-10 w-full rounded border border-gray-300"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-6">
          {qrValue ? (
            <div className="flex flex-col items-center space-y-4">
              <div ref={qrRef} className="rounded-xl bg-white p-4 shadow-md">
                <QRCodeSVG
                  value={qrValue}
                  size={qrSize}
                  bgColor={qrBgColor}
                  fgColor={qrFgColor}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="flex w-full max-w-md flex-col">
                <div className="mb-2 overflow-hidden text-ellipsis rounded-lg border border-gray-200 bg-gray-50 p-2 text-center text-sm">
                  <span className="font-medium">QR Content:</span> {qrValue.length > 40 ? `${qrValue.substring(0, 40)}...` : qrValue}
                </div>
                {isUrl && (
                  <div className="mt-1 text-center text-sm text-blue-600">
                    <a href={qrValue} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Visit URL
                    </a>
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                <button
                  onClick={downloadQRCode}
                  className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Download QR
                </button>
                <button
                  onClick={copyToClipboard}
                  className="relative rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {copySuccess ? 'Copied!' : 'Copy Value'}
                  {copySuccess && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white">
                      {copySuccess}
                    </span>
                  )}
                </button>
                <button
                  onClick={clearQrCode}
                  className="rounded bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center text-gray-500">
              <svg className="mb-2 h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <p className="text-lg">Enter text or a number and click "Generate QR" to create your QR code</p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} QR Code Generator. All rights reserved.</p>
        <p className="mt-1">Generate QR codes for URLs, text, contact info, and more.</p>
      </footer>
    </div>
  );
}

export default App;
