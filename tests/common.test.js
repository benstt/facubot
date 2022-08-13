const { findMatch, recordInfoUtils } = require('../common.js');

test('finds match of subjects with numbers', () => {
    const possibleMatches = ['Arquitectura I', 'Arquitectura II', 'Arquitectura III'];
    expect(findMatch('Arquitectura 1', possibleMatches)).toBe('Arquitectura I');
    expect(findMatch('Arquitectura 2', possibleMatches)).toBe('Arquitectura II');
    expect(findMatch('Arquitectura 3', possibleMatches)).toBe('Arquitectura III');
});

test('checks record year, URL and user', () => {
    const dateSample = '2021-03-05';
    const URLsample = 'https://example.org/';
    const userSample = 'user#1234';

    const record = {
        dataValues: {
            date: dateSample,
            fileURL: URLsample,
            uploadUser: userSample,
        }
    }

    expect(recordInfoUtils.getRecordDate(record).format('YYYY')).toBe('2021');
    expect(recordInfoUtils.getRecordURL(record)).toBe(URLsample);
    expect(recordInfoUtils.getUserWhoUploaded(record)).toBe(userSample);
});