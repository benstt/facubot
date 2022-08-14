const { SlashCommandBuilder, bold, inlineCode } = require('discord.js');

const commandSchema = new SlashCommandBuilder()
        .setName('sobre')
        .setDescription('Información general del bot.')

const MESSAGE = `
${bold('FACUBOT v1.0.0')}
Este bot sirve para mandar finales/parciales/resúmenes de alguna materia de la facultad. Por ahora, se limita a las materias de las carreras de Lic. en Sistemas (+ analista) e Ing. en Informática.

${bold('COMANDOS')}:
- ${inlineCode('/parcial [materia]')}: te devuelve ${bold('un')} parcial al azar de la materia especificada.
- ${inlineCode('/final [materia] [año (opcional)]')}: te devuelve ${bold('un')} final al azar de la materia especificada, o uno del año dado.
- ${inlineCode('/parciales [materia]')}: te devuelve ${bold('todos')} los parciales encontrados de la materia especificada.
- ${inlineCode('/finales [materia] [año (opcional)]')}: te devuelve ${bold('todos')} los finales encontrados de la materia especificada, o todos del año dado.
- ${inlineCode('/registrar_parcial [materia] [archivo]')}: registra un parcial en la base de datos.
- ${inlineCode('/registrar_final [materia] [archivo] [año (opcional)]')}: registra un final en la base de datos.
- ${inlineCode('/resumen')}: todavía no está implementado, jeje.

Por favor ${bold('traten de limitarse a subir archivos PDF, DOCx, RARs, etc.')} que tengan que ver con la facultad y no sean muy pesados. Tengan en cuenta que ${bold('cualquier persona en el servidor')} puede subir archivos; el bot no es muy facil de mantener y es un quilombo tener que ir borrando archivos uno por uno en la BD en caso de que haya alguno de más.

${bold('PROBLEMAS / CONTRIBUIR')}:
Ante cualquier bug que encuentren me avisan por Discord (${inlineCode('bnja#5809')}) o suben el [issue al repo de GH](https://github.com/grbenjamin/facubot/issues).
Si quieren contribuir al código pueden hacer un PR al repositorio: (https://github.com/grbenjamin/facubot). Gracias :)
`

module.exports = {
    data: commandSchema,
    async execute(interaction) {
        interaction.reply(MESSAGE);
    },
}