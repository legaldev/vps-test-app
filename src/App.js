import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import axios from 'axios'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Button from '@material-ui/core/Button'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import LinearProgress from '@material-ui/core/LinearProgress'

import { BASE_URL } from './constants'

const useStyles = makeStyles(theme => ({
  container: {
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(2)
  },
  main: {
    display: 'flex'
  },
  ships: {
    width: '50%',
    padding: theme.spacing(2),
    marginRight: theme.spacing(1),
    backgroundColor: theme.palette.background.paper
  },
  pilots: {
    width: '50%',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper
  },
  placeholder: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '50%',
    backgroundColor: theme.palette.background.paper
  },
  buttonsGroup: {
    marginTop: theme.spacing(1)
  },
  button: {
    minWidth: 120
  }
}))

const App = () => {
  const classes = useStyles()

  const [ships, setShips] = useState([])
  const [chosenShip, setChosenShip] = useState(null)
  const [pilotsByShip, setPilotsByShip] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const url = `${BASE_URL}starships${currentPage !== 1 ? `?page=${currentPage}` : ''}`

    setIsLoading(true)
    axios
      .get(url)
      .then(response => {
        setShips(response.data.results)
        setHasNext(!!response.data.next)
        setHasPrevious(!!response.data.previous)
      })
      .catch(error => {
        console.log(error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [currentPage])

  const handleChooseShip = (ship, pilotUrls) => {
    if (!pilotsByShip[ship]) {
      setIsLoading(true)
      Promise.all(pilotUrls.map(pilotUrl => axios.get(pilotUrl)))
        .then(response => {
          const pilots = response.map(pilot => pilot.data)
          setPilotsByShip({ ...pilotsByShip, [ship]: pilots })
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
    setChosenShip(ship)
  }

  const canRenderPilots = chosenShip && pilotsByShip[chosenShip] && pilotsByShip[chosenShip].length

  return (
    <div className={classes.container}>
      <div>
        <div className={classes.main}>
          <List className={classes.ships}>
            {ships.map(({ name, pilots }) => (
              <ListItem
                key={name}
                button
                onClick={() => handleChooseShip(name, pilots)}
                selected={name === chosenShip}
              >
                <ListItemText>{name}</ListItemText>
              </ListItem>
            ))}
          </List>
          {canRenderPilots ? (
            <List className={classes.pilots}>
              {pilotsByShip[chosenShip].map(({ name }) => (
                <ListItem key={name}>
                  <ListItemText>{name}</ListItemText>
                </ListItem>
              ))}
            </List>
          ) : (
            <div className={classes.placeholder}>No data</div>
          )}
        </div>
        {isLoading && <LinearProgress />}
        <ButtonGroup
          className={classes.buttonsGroup}
          color='primary'
          aria-label='outlined primary button group'
        >
          {hasPrevious && (
            <Button
              className={classes.button}
              onClick={() => {
                setCurrentPage(currentPage - 1)
                setChosenShip(null)
              }}
              disabled={isLoading}
            >
              Previous
            </Button>
          )}
          {hasNext && (
            <Button
              className={classes.button}
              onClick={() => {
                setCurrentPage(currentPage + 1)
                setChosenShip(null)
              }}
              disabled={isLoading}
            >
              Next
            </Button>
          )}
        </ButtonGroup>
      </div>
    </div>
  )
}

export default App
