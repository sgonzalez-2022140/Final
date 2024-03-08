import { initServer } from "./configs/app.js"
import { connect } from "./configs/mongo.js"
import { userDefect } from './src/user/user.controller.js'

initServer()
connect()


userDefect()