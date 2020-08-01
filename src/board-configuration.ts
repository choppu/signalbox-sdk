import { ADCConfiguration } from "./adc-configuation"
import { DACConfiguration } from "./dac-configuration"
import { OPAMPConfiguration } from "./opamp-configuration"
import { BoardInfo } from "./board-info";

const TERMINATOR = 0;
const ADC_ID = 1;
const DAC_ID = 2;
const OPAMP_ID = 3;

export class BoardConfiguration {
  adcConfiguration: ADCConfiguration[];
  dacConfiguration: DACConfiguration[];
  opampConfiguration: OPAMPConfiguration[];

  constructor(adcConfiguration: ADCConfiguration[], dacConfiguration: DACConfiguration[], opampConfiguration: OPAMPConfiguration[]) {
    this.adcConfiguration = adcConfiguration;
    this.dacConfiguration = dacConfiguration;
    this.opampConfiguration = opampConfiguration;
  }

  write(buf: Buffer, offset: number, boardInfo: BoardInfo) : number {
    this.adcConfiguration.forEach((adc) => {
      buf.writeUInt8(ADC_ID, offset++);
      offset = adc.write(buf, offset, boardInfo);
    });
    this.dacConfiguration.forEach((dac) => {
      buf.writeUInt8(DAC_ID, offset++);
      offset = dac.write(buf, offset, boardInfo);
    });
    this.opampConfiguration.forEach((opamp) => {
      buf.writeUInt8(OPAMP_ID, offset++);
      offset = opamp.write(buf, offset);
    });

    buf.writeUInt8(TERMINATOR, offset++);

    return offset;
  }

  public static getDefault(boardInfo: BoardInfo) : BoardConfiguration | null {
    if (boardInfo.vendorID == '0483' && boardInfo.productID == '5740') {
      return new BoardConfiguration(
        [new ADCConfiguration(
          0, 
          true, 
          3, 
          0, 
          799, 
          [{enabled: true, sampleTime: 1}]
        )],
        [new DACConfiguration(
          0,
          true,
          0,
          799,
          [true]
        )],
        [new OPAMPConfiguration(
          0, 
          true,
          1, 
          true
        ),
        new OPAMPConfiguration(
          1, 
          true,
          1, 
          true
        )]);
    } else {
      return null;
    }
  }

  public static fromPlainObject(config: any) : BoardConfiguration {
    return new BoardConfiguration(
      config.adcConfiguration.map((adc) => ADCConfiguration.fromPlainObject(adc)),
      config.dacConfiguration.map((dac) => DACConfiguration.fromPlainObject(dac)),
      config.opampConfiguration.map((opamp) => OPAMPConfiguration.fromPlainObject(opamp)),
    );
  }
}