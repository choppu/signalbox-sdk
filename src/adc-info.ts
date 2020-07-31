export class ADCInfo {
  sampleSize: number;
  channelCount: number;
  supportedOversampling: object[];
  supportedSamplingTimes: object[];
  prescalerSize: number;
  periodSize: number;

  constructor(sampleSize: number, channelCount: number, supportedOversampling: object[], supportedSamplingTimes: object[], prescalerSize: number, periodSize: number) {
    this.sampleSize = sampleSize;
    this.channelCount = channelCount;
    this.supportedOversampling = supportedOversampling;
    this.supportedSamplingTimes = supportedSamplingTimes;
    this.prescalerSize = prescalerSize;
    this.periodSize = periodSize;
  }
}