import { Analytics } from '@vercel/analytics/react'

import { Button, FormControl, InputLabel, MenuItem, Select, SvgIcon } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import DarkModeIcon from '@mui/icons-material/DarkMode';

import Head from 'next/head'
import Image from 'next/image'
import { useFormik } from 'formik';

import { Nunito_Sans } from '@next/font/google'
import { useEffect, useState } from 'react';

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['300', '600', '800'],
  display: 'swap'
})


enum Regions {
  AFRICA,
  AMERICA,
  ASIA,
  EUROPE,
  OCEANIA
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


const handleCountryData = async (
  countryRegionName: string | Regions,
  setCountryFilteredList: any,
  setMessage: any,
  limit?: number | string,
  countryName?: string,
  regionName?: string,
) => {
  if ( countryRegionName !== '' || ( countryRegionName === '' && ( countryName !== '' || regionName !== '' ) )  ) {
    let querySearch = '';

    if ( Object.values(Regions).includes(countryRegionName) || regionName !== '' ) {
      const newRegionValue = ( Object.values(Regions).includes(countryRegionName) ? countryRegionName : regionName )

      querySearch = `region/${newRegionValue}`
    } else {
      querySearch = `name/${countryRegionName}`
    }

    await fetch(`https://restcountries.com/v3.1/${querySearch}`)
      .then(response => response.json())
      .then(data => {
        if ( regionName !== '' && countryName !== '' && countryName !== undefined ) {
          console.log(countryName)
          data = data.filter((country: { name: { common: (string | undefined)[]; }; }) => String(country.name.common).toLowerCase().includes(countryName.toLowerCase()))
          console.log(data)
        }
        setCountryFilteredList(( limit !== '' ? data.slice(0, limit) : data ))
      })
      .catch((error) => {
        setMessage(`${countryRegionName} not found as a country`)
     })
  }
}


const Home = () => {
  const [darkMode, setDarkMode] = useState(false)
  const [countryName, setCountryName] = useState('')
  const [regionName, setRegionName] = useState('')
  const [message, setMessage] = useState('')
  const [countryFilteredList, setCountryFilteredList] = useState([
    {
      name: {
        common: '',
      },
      region: '',
      capital: [],
      population: 0,
      flags: {
        png: '',
        svg: ''
      }
    }
  ])

  useEffect(() => {
    if ( countryFilteredList[0].name.common === '' ) {
      handleCountryData(Regions[Regions.EUROPE], setCountryFilteredList, setMessage, 10, countryName, regionName)
    }
  }, [])

  return (
    <div className={`${nunitoSans.className} ${darkMode ? 'dark-mode' : null }`}>
      <Head>
        <title>REST API Country</title>
        <meta name="description" content="REST API Country" />
        <meta name="author" content="Moro Samuele" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <header>
        <h1>Where in the world?</h1>
        <Button
          variant="text"
          color="inherit"
          startIcon={<SvgIcon component={DarkModeIcon} />}
          className="header__switchButtonDarkLightMode"
          onClick={() => { setDarkMode(!darkMode) }}>
          Dark Mode
        </Button>
      </header>

      <main>
        <form className="main__searchFilterBar">
          <div className="searchFilterBar__searchInputContainer">
            <SvgIcon component={SearchIcon} />
            <input
              type="text"
              name="countryName"
              value={countryName}
              placeholder="Search for a country..."
              onChange={(e) => setCountryName(e.target.value)}
              onKeyUp={() => handleCountryData(countryName, setCountryFilteredList, setMessage, '', countryName, regionName)}
            />
          </div>
          {
              message !== '' &&
                <p className="searchFilterBar__errorInputSearch">{message}</p>
            }
          <div className="searchFilterBar__filterRegionSelectContainer">
            <select
              name="regionName"
              onChange={(e) => {
                setRegionName(e.target.value)
                handleCountryData(e.target.value, setCountryFilteredList, setMessage, '', countryName, regionName)
              }}
              value={regionName}
              id="searchFilterBar__filterRegionSelect"
            >
              <option value="">Filter by Region</option>
              <option value={Regions[Regions.AFRICA]}>Africa</option>
              <option value={Regions[Regions.AMERICA]}>America</option>
              <option value={Regions[Regions.ASIA]}>Asia</option>
              <option value={Regions[Regions.EUROPE]}>Europe</option>
              <option value={Regions[Regions.OCEANIA]}>Oceania</option>
            </select>
          </div>
        </form>

        <section className="main__listFilteredCountries">
          {
            countryFilteredList.length > 0 ?
              countryFilteredList.map((country, index) => {
                return (
                  <div key={index} className="listFilteredCountries__countryContainer">
                    <div className="listFilteredCountries__countryFlag">
                      <Image
                        src={country.flags.svg}
                        alt={country.name.common}
                        fill
                      />
                    </div>
                    <div className="listFilteredCountries__countrySummaryInfos">
                      <h3>{country.name.common}</h3>
                      <div className="countrySummaryInfos">
                        <p>
                          <strong>Population:</strong>
                          <span>{country.population.toLocaleString()}</span>
                        </p>
                        <p>
                          <strong>Region:</strong>
                          <span>{country.region}</span>
                        </p>
                        <p>
                          <strong>Capital:</strong>
                          <span>{country.capital}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
              :
              'No country found'
          }
        </section>
      </main>

      <Analytics />
    </div>
  )
}

export default Home