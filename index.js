const {app, BrowserWindow} = require('electron')
const express = require('express')

const server = express()
server.use(express.static(`${__dirname}/dist`))
server.listen(8080)

let window

function createWindow () {
	window = new BrowserWindow({
		width: 800,
		height: 600,
		kiosk: true,
		"web-preferences": {
			"web-security": false
		}
	})
	window.loadURL(`http://localhost:8080`)
	window.on('closed', () => {
		window = null
	})
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (win === null) {
		createWindow()
	}
})
