import React, { useState } from 'react';
import './Settings.css';
import { Bluetooth, Printer } from 'lucide-react';

import { useAppContext } from '../context/AppContext';

const Settings = () => {
  const { bluetoothDevice, setBluetoothDevice, printerCharacteristic, setPrinterCharacteristic, useRawBT, setUseRawBT } = useAppContext();
  const isBluetoothConnected = !!(bluetoothDevice && printerCharacteristic);
  
  const [paperSize, setPaperSize] = useState('58mm');
  const [printLogo, setPrintLogo] = useState(false);

  const handleConnectBluetooth = async () => {
    try {
      if (navigator.bluetooth) {
        const device = await navigator.bluetooth.requestDevice({
          filters: [
            { services: ['000018f0-0000-1000-8000-00805f9b34fb'] },
            { services: ['e7810a71-73ae-499d-8c15-faa9aef0c3f2'] },
            { services: ['0000fee7-0000-1000-8000-00805f9b34fb'] },
            { services: ['49535343-fe7d-4ae5-8fa9-9fafd205e455'] }
          ],
          optionalServices: [
            '000018f0-0000-1000-8000-00805f9b34fb',
            'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
            '0000fee7-0000-1000-8000-00805f9b34fb',
            '49535343-fe7d-4ae5-8fa9-9fafd205e455'
          ]
        });

        const server = await device.gatt.connect();
        
        let targetCharacteristic = null;
        const services = await server.getPrimaryServices();

        for (const service of services) {
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              targetCharacteristic = char;
              break;
            }
          }
          if (targetCharacteristic) break;
        }

        if (targetCharacteristic) {
          setBluetoothDevice(device);
          setPrinterCharacteristic(targetCharacteristic);
          alert('Printer connected successfully!');
        } else {
          alert('No writable characteristic found for printing.');
        }

      } else {
        alert('Web Bluetooth is not supported on this device/browser.');
      }
    } catch (error) {
      console.error(error);
      alert(`Bluetooth connection failed: ${error.message || 'Cancelled by user.'}`);
    }
  };

  const handleDisconnect = () => {
    if (bluetoothDevice && bluetoothDevice.gatt.connected) {
      bluetoothDevice.gatt.disconnect();
    }
    setBluetoothDevice(null);
    setPrinterCharacteristic(null);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>App Settings</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your application preferences and hardware</p>
      </div>

      <div className="settings-card">
        <h3><Bluetooth size={20} /> Bluetooth Devices</h3>
        
        <div className="settings-group">
          <p className="settings-label" style={{ marginBottom: '16px' }}>Connect to a Thermal Printer via Bluetooth</p>
          
          {!isBluetoothConnected ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="btn btn-primary" onClick={handleConnectBluetooth} style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start' }}>
                <Bluetooth size={18} />
                Pair Bluetooth Printer
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Tip: If your printer shows up as "Unknown Device", try pairing it in your device's Bluetooth settings first, or just select the "Unknown Device" to connect.
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button className="btn btn-danger" onClick={handleDisconnect}>
                Disconnect Printer
              </button>
            </div>
          )}

          <div className="bluetooth-status">
            <div className={`status-dot ${isBluetoothConnected ? 'connected' : 'disconnected'}`}></div>
            <span>Status: {isBluetoothConnected ? `Connected to ${bluetoothDevice?.name || 'Printer'}` : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h3><Printer size={20} /> Printing Settings (New Bill Page)</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
          These settings only apply to the "Print Bill" option for thermal printers on the New Billing page.
        </p>
        
        <div className="settings-group">
          <label className="settings-label">Thermal Printer Paper Size</label>
          <select 
            className="settings-select" 
            value={paperSize} 
            onChange={(e) => setPaperSize(e.target.value)}
          >
            <option value="58mm">58mm (2 inch)</option>
            <option value="80mm">80mm (3 inch)</option>
          </select>
        </div>

        <div className="settings-group" style={{ marginTop: '20px' }}>
          <label className="settings-label">Print Receipt Header/Logo</label>
          <div className="toggle-container">
            <input 
              type="checkbox" 
              id="printLogo" 
              checked={printLogo} 
              onChange={(e) => setPrintLogo(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="printLogo" style={{ cursor: 'pointer' }}>Include shop name and details at the top</label>
          </div>
        </div>

        <div className="settings-group" style={{ marginTop: '20px' }}>
          <label className="settings-label">Android POS Print Settings</label>
          <div className="toggle-container" style={{ marginTop: '8px' }}>
            <input 
              type="checkbox" 
              id="useRawBT" 
              checked={useRawBT} 
              onChange={(e) => setUseRawBT(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="useRawBT" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
              <span>Use RawBT App for Direct Printing</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Enable this to instantly bypass the browser print dialog if you have the RawBT app installed on your Android billing machine.</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
