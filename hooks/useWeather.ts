import axios from 'axios'
import { z } from 'zod'
// import { object, string, number, parse} from 'valibot'
import { SearchType } from '../types';
import { useMemo, useState } from 'react';

//Zod
const Weather = z.object({
    name: z.string(),
    main: z.object({
        temp: z.number(),
        temp_min: z.number(),
        temp_max: z.number()
    })
})

export type Weather = z.infer<typeof Weather>

//Valibot
// const WeatherSchema = object({
//     name: string(),
//     main: object({
//         temp: number(),
//         temp_min: number(),
//         temp_max: number()
//     })
// })

const initialState = {
    name: '',
    main: {
        temp: 0,
        temp_min: 0,
        temp_max: 0
    }
}

export default function useWeather() {
    const [weather, setWeather] = useState({
        name: '',
        main: {
            temp: 0,
            temp_min: 0,
            temp_max: 0
        }
    })
    const [loading, setLoading] = useState(false)
    const [isNotFound, setIsNotFound] = useState(false)

    const fetchWeather = async (search: SearchType) => {
        const appId = import.meta.env.VITE_API_KEY
        setLoading(true);
        setWeather(initialState);
        try {
            const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${search.city},${search.country}&&appid=${appId}`
            // el .get es default pero puedes definir el método 
            const {data} = await axios.get(geoUrl)

            //Comprobar si existe la ciudad
            if (!data[0]) {
                setIsNotFound(true)
                return
            }

            const lat = data[0].lat
            const lon = data[0].lon
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`            
            
            //Zod
            const {data: weatherData} = await axios(weatherUrl)
            const result = Weather.safeParse(weatherData)

            if(result.success){
                setWeather(result.data)
            }

            //Valibot
            // const {data: weatherData} = await axios(weatherUrl)
            // const result = parse(WeatherSchema, weatherData)
            // if(result){
            //     console.log(result.name, Number((result.main.temp - 273.15).toFixed(1)))
            // } else {
            //     console.log('Error')
            // }
            
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }

    }

    const hasWeatherData = useMemo(() => weather.name, [weather])

    return {
        weather,
        fetchWeather,
        hasWeatherData,
        loading,
        isNotFound
    }
}