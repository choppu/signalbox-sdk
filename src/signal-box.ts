import SerialPort = require("serialport");
import { EventEmitter } from  'events';

export class SignalBox extends EventEmitter {
  port: SerialPort;
  sampleSize: number;
  maxSampleValue: number;


  constructor(path: string) {
    super();

    this.port = new SerialPort(path, {autoOpen: false});
    this.sampleSize = 2;
    this.maxSampleValue = 0xfff0;

    this.port.on('readable', () => {
      this.port.read();
    });
    
    this.port.on('data', (data) => {
      let parsedData = [];
      for (let i = 0; i < data.length; i += this.sampleSize) {
        let sample = (data.readUInt16LE(i) / this.maxSampleValue);
        parsedData.push(sample);
      }
      this.emit('data-read', parsedData);
    });
  }

  connect() : Promise<void> {
    return new Promise((resolve, reject) => {
      this.port.open((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  run() : Promise<void> {
    return new Promise((resolve, reject) => {
      this.port.set({rts: false}, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });  
  }

  stop() : Promise<void> {
    return new Promise((resolve, reject) => {
      this.port.set({rts: true}, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });  
  }

  async configure(params: object) : Promise<void> {

  }

  public static async getSerialPorts() : Promise<SerialPort.PortInfo[]> {
    return await SerialPort.list();
  }
}