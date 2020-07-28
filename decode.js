  exports.decodeRapidWind = (ob) => {
      const [timestamp, mps, direction] = ob;
      return {
          timestamp,
          mps,
          direction
      };
  };

  exports.decodeObsSt = (obs0) => {
      const [
          time,
          wind_lull,
          wind_avg,
          wind_gust,
          wind_direction,
          wind_sample_interval,
          station_pressure,
          temperature,
          relative_humidity,
          illuminance,
          uv,
          solar_radiation,
          rain_accumulated,
          precipitation_type,
          lightning_strike_avg_distance,
          lightning_strike_count,
          battery,
          report_interval,
      ] = obs0;
      return {
          time,
          wind_lull,
          wind_avg,
          wind_gust,
          wind_direction,
          wind_sample_interval,
          station_pressure,
          temperature,
          relative_humidity,
          illuminance,
          uv,
          solar_radiation,
          rain_accumulated,
          precipitation_type,
          lightning_strike_avg_distance,
          lightning_strike_count,
          battery,
          report_interval,
      };
  };