import { SecondsToMinutesPipe } from './seconds-to-minutes.pipe';

describe('SecondsToMinutesPipe', () => {
  it('create an instance', () => {
    const pipe = new SecondsToMinutesPipe();
    expect(pipe).toBeTruthy();
  });
});
