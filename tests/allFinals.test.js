const { getFinalsFromYear } = require('../commands/allFinals.js');

test('check for all the finals of some year in array', () => {
    const allFinalsMock = [
        {
            dataValues: {
                date: '2018-05-24',
            }
        },
        {
            dataValues: {
                date: '2018-04-12',
            }
        },
        {
            dataValues: {
                date: '2022-12-01',
            }
        },
    ];

    const yearWanted = '2018';
    const finals = getFinalsFromYear(yearWanted, allFinalsMock);
    const expectedFinals = [{ dataValues: { date: '2018-05-24' } }, { dataValues: { date: '2018-04-12' } }]
    expect(finals).toStrictEqual(expectedFinals);
});

test('check for finals of some year in array and give nothing', () => {
    const allFinalsMock = [
        {
            dataValues: {
                date: '2012-05-24',
            }
        },
        {
            dataValues: {
                date: '2018-04-12',
            }
        },
        {
            dataValues: {
                date: '2022-12-01',
            }
        },
    ];

    const yearWanted = '2011';
    const finals = getFinalsFromYear(yearWanted, allFinalsMock);
    expect(finals).toStrictEqual([]);
});