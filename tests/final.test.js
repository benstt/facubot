const { getIndexOfFinalFromYear } = require('../commands/final.js');

test('check for final of some year in array', () => {
    const allFinalsMock = [
        {
            dataValues: {
                date: '2012-05-24',
                fileURL: 'https://example.org/',
                uploadUser: 'user#1235'
            }
        },
        {
            dataValues: {
                date: '2018-04-12',
                fileURL: 'https://example.org/',
                uploadUser: 'user#1334'
            }
        },
        {
            dataValues: {
                date: '2022-12-01',
                fileURL: 'https://example.org/',
                uploadUser: 'user#1214'
            }
        },
    ];

    const yearWanted = '2018';
    const i = getIndexOfFinalFromYear(yearWanted, allFinalsMock);
    expect(i).toBe(1);
});

test('check for indexistent final of some year in array', () => {
    const allFinalsMock = [
        {
            dataValues: {
                date: '2012-05-24',
                fileURL: 'https://example.org/',
                uploadUser: 'user#1235'
            }
        },
        {
            dataValues: {
                date: '2018-04-12',
                fileURL: 'https://example.org/',
                uploadUser: 'user#1334'
            }
        },
        {
            dataValues: {
                date: '2022-12-01',
                fileURL: 'https://example.org/',
                uploadUser: 'user#1214'
            }
        },
    ];

    const yearWanted = '2019';
    const i = getIndexOfFinalFromYear(yearWanted, allFinalsMock);
    expect(i).toBe(-1);
});