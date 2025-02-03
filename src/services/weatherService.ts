import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export class WeatherService {
  private API_KEY = process.env.OPENWEATHERMAP_API_KEY;

  async getWeather(destination: string){
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      destination
    )}&appid=${this.API_KEY}&units=metric&lang=es`;
    const response = await axios.get(url);
    const data = response.data;
    return data;
  }
}