const { bold } = require('discord.js');

const NoFinalsFoundError = subject => {
    return `Por el momento no hay ningún final de ${bold(subject)}. Gracias vuelvas prontos.`;
}

const NoExamsFoundError = subject => {
    return `Por el momento no hay ningún parcial de ${bold(subject)}. Gracias vuelvas prontos.`;
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
    NoExamsFoundError,
    NoFinalsFromYearError,
    InvalidFinalDateError,
    InvalidFinalFieldError,
    SubjectGivenNotClearError,

}