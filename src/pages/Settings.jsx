import React, { useState } from 'react';
import './Settings.css';
import { Bluetooth, Printer } from 'lucide-react';

import { useAppContext } from '../context/AppContext';

const Settings = () => {
  const { bluetoothDevice, setBluetoothDevice, printerCharacteristic, setPrinterCharacteristic } = useAppContext();
  const isBluetoothConnected = !!(bluetoothDevice && printerCharacteristic);
  
  const [paperSize, setPaperSize] = useState('58mm');
  const [printLogo, setPrintLogo] = useState(false);

  const handleConnectBluetooth = async () => {
    try {
      if (navigator.bluetooth) {
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
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
      alert('Bluetooth connection failed or was cancelled.');
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
            <button className="btn btn-primary" onClick={handleConnectBluetooth} style={{ display: 'flex', gap: '8px' }}>
              <Bluetooth size={18} />
              Pair Bluetooth Printer
            </button>
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
      </div>
    </div>
  );
};

export default Settings;
