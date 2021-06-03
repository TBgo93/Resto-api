const express = require('express')
const Meals = require('../models/Meals')

const router = express.Router()
//Buscar
router.get('/', (req, res) => {
    Meals.find()
        .exec()
        .then(x => res.status(200).send(x))
})
//Buscar por id
router.get('/:id', (req, res) =>{
    Meals.findById(req.params.id)
        .exec()
        .then(x => res.status(200).send(x))
})
//Crear
router.post('/', (req, res) => {
    Meals.create(req.body)
        .then(x => res.status(201).send(x))
})
//Modificar
router.put('/:id', (req, res) => {
    Meals.findByIdAndUpdate(req.params.id, req.body)
        .then(() => res.sendStatus(204))
})
//Eliminar
router.delete('/:id', (req, res) => {
    Meals.findByIdAndDelete(req.params.id)
        .exec()
        .then(() => res.sendStatus(204))
})

module.exports = router