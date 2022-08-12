const { bold } = require('discord.js');

const NoFinalsFoundError = subject => {
    return `No se encontró ningún final de ${bold(subject)}, por el momento.`;
}

const NoFinalsFromYearError = year => {
    return `No encontré ningún final del ${bold(year)}, perdón!`;
}

const InvalidFinalDateError = () => {
    return 'La fecha no válida, ingresá solo el año del final.';
}

const InvalidFinalFieldError = () => {
    return 'Checkeá que hayas puesto bien todos los campos (y tratá de no usar abreviaciones para las materias!).';
}

const SubjectGivenNotClearError = () => {
    return 'Es difícil saber a qué materia te referís. Por favor, tratá de poner el nombre completo.';
}

module.exports = {
    NoFinalsFoundError,
    NoFinalsFromYearError,
    InvalidFinalDateError,
    InvalidFinalFieldError,
    SubjectGivenNotClearError,

}