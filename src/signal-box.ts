import SerialPort = require("serialport");
import { EventEmitter } from  'events';
import { BoardInfo } from "./board-info";
import { BoardConfiguration } from "./board-configuration";

const CMD_SET_CONFIG = 0x01;
const BAUD_START = 57600;
const BAUD_STOP = 9600;
const READABLE = 8096;

export class SignalBox extends EventEmitter {
  port: SerialPort;
  sampleSize: number;
  maxSampleValue: number;
  boardInfo: BoardInfo;
  configuration: BoardConfiguration;
  isRunning: boolean;


  constructor(path: string, boardInfo: BoardInfo) {
    super();

    this.port = new SerialPort(path, {autoOpen: false});
    this.sampleSize = 2;
    this.maxSampleValue = 0x3ffc;
    this.boardInfo = boardInfo;
    this.isRunning = false;
    this.configuration = BoardConfiguration.getDefault(this.boardInfo);

    this.port.on('readable', () => {
      if(this.isRunning) {
        this.port.read(READABLE);
      } else {
        this.port.read()
      }    
    });
    
    this.port.on('data', (data) => {
      if (this.isRunning) {
        this.forwardData(data);
      } else {
        if(data[0] == CMD_SET_CONFIG) {
          this.doRun();
        }
      }
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

  async run() : Promise<void> {
    await this.configure(); 
  }

  async stop() : Promise<void> {
    await this.setBaudRate(BAUD_STOP); 
    this.isRunning = false;
  }

  async configure() : Promise<void> {
    let data = Buffer.alloc(64);
    data.writeUInt8(CMD_SET_CONFIG, 0);
    this.configuration.write(data, 1, this.boardInfo);
    await this.doWrite(data);
  }

  async write(data: number[]) : Promise<void> {
    let encodedData = Buffer.alloc(data.length * 2);
    data.forEach((el, i) => encodedData.writeUIntLE(el * 0x0fff, i * this.sampleSize, this.sampleSize));
    await this.doWrite(encodedData);
  }

  public static async getSerialPorts() : Promise<SerialPort.PortInfo[]> {
    return await SerialPort.list();
  }

  doWrite(data: Buffer) : Promise<void> {
    return new Promise((resolve, reject) => {
      this.port.write(data, 'binary', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  setBaudRate(rate: number) : Promise<void> {
    return new Promise((resolve, reject) => {
      this.port.update({baudRate: rate}, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }); 
  }

  async doRun() : Promise<void> {
    this.isRunning = true; 
    await this.setBaudRate(BAUD_START);
    this.emit('is-running');
  }

  forwardData(data: Buffer) {
    let parsedData = [];
    for (let i = 0; i < data.length; i += this.sampleSize) {
      let sample = (data.readUIntLE(i, this.sampleSize) / this.maxSampleValue);
      parsedData.push(sample);
    }
    this.emit('data-read', parsedData);
  }
}