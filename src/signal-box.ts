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
  boardInfo: BoardInfo;
  configuration: BoardConfiguration;
  isRunning: boolean;


  constructor(path: string, boardInfo: BoardInfo) {
    super();

    this.port = new SerialPort(path, {autoOpen: false});
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
    await this.flushSerial();
    await this.setBaudRate(BAUD_STOP);
    await this.port.read();
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
    data.forEach((el, i) => encodedData.writeUIntLE(el * this.boardInfo.dac[0].maxValue, i * this.boardInfo.dac[0].sampleSize, this.boardInfo.dac[0].sampleSize));
    await this.doDrain();
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

  async flushSerial() : Promise<void> {
    return new Promise((resolve, reject) => {
      this.port.flush((err) => {
        err ? reject(err) : resolve(); 
      }); 
    })
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

  async doDrain() : Promise<void> {
    return new Promise((resolve, reject) => {
      this.port.drain((err) => {
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
    let oversamplingConf = this.configuration.adcConfiguration[0].oversampling;
    let oversampling = SignalBox.searchInObjectsArray(this.boardInfo.adc[0].supportedOversampling, "value", oversamplingConf) as {label: string, value: number, maxValue: number};
    for (let i = 0; i < data.length; i += this.boardInfo.adc[0].sampleSize) {
      let sample = (data.readUIntLE(i, this.boardInfo.adc[0].sampleSize) / oversampling.maxValue);
      parsedData.push(sample);
    }
    this.emit('data-read', parsedData);
  }

  public static searchInObjectsArray(arr: object[], valLabel: string, val: any) : object {
    return arr.find((obj) => obj[valLabel] == val);
  }
}