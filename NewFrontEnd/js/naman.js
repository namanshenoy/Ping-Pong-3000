/* eslint-disable no-restricted-globals */
/* eslint-disable no-console */
/* eslint-disable no-useless-concat */
/* eslint-disable no-unused-vars */

// const app = {
//   methods: {},
//   data() {return {}}
// }
const namanjs = (appId, app) => {
  const debug = out => console.log('%c DEBUG:' + `%c ${JSON.stringify(out)} `, 'color: green; background-color: yellow; padding: 5px;', 'color: black; background-color: white;')
  console.log('%c NamanJS:' + `%c SETUP ${appId}`, 'color: white; background-color: green;padding: 5px;', 'color: black; background-color: white;')
  document.querySelectorAll('[data-click]')
    .forEach((el) => {
      const action = el.dataset.click
      const argumentsArray = action.match(/\((.*?)\)/)[1].split(',')
      const finalArgumentsArray = []

      argumentsArray.forEach((arg) => {
        if (arg.includes('\'')) {
          finalArgumentsArray.push(arg.replace(/'/g, ''))
        } else if (!isNaN(arg)) {
          if (Number.isInteger(arg)) {
            finalArgumentsArray.push(parseInt(arg, 10))
          } else {
            finalArgumentsArray.push(parseFloat(arg))
          }
        } else if (app.data()[arg]) {
          finalArgumentsArray.push(app.data()[arg])
        } else if (app.methods[arg]) {
          finalArgumentsArray.push(app.methods[arg])
        }
      })
      const finalFunction = app.methods[action.split('(')[0]]
      finalFunction.bind(app.methods)
      console.log(finalFunction)
      el.addEventListener('click', finalFunction(app.data(), ...finalArgumentsArray))
    })
}
