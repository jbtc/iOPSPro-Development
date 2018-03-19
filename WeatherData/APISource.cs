using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace WeatherData
{
    public class APISource

    {

        public async Task<WeatherObservation> CurrentWeatherForSite(string site)
        {

            return await CurrentWeatherXML("IAH");
            await StationsJSON();

        }

        public async Task<IEnumerable<station>> Stations(string site)
        {

            return await StationsJSON();

        }




        static async Task<IEnumerable<station>> StationsJSON()
        {
            System.Net.Http.HttpClient cons = new HttpClient();
            cons.DefaultRequestHeaders.Accept.Clear();
            cons.DefaultRequestHeaders.Add("User-Agent", "JBT iOPS");
            cons.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/geo+json"));
            using (cons)
            {
                HttpResponseMessage res = await cons.GetAsync("https://api.weather.gov/stations");
                res.EnsureSuccessStatusCode();
                if (res.IsSuccessStatusCode)
                {
                    var result = await res.Content.ReadAsStringAsync();
                    System.Web.Script.Serialization.JavaScriptSerializer serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
                    Dictionary<string, object> itemDict = serializer.Deserialize<Dictionary<string, object>>(result) as Dictionary<string, object>;

                    List<Dictionary<string, object>> graphList = (itemDict["features"] as ArrayList).ToList<Dictionary<string, object>>(); ;

                    var graph = graphList
                            .AsParallel()
                            .Select(s => new station
                            {

                                URL = s["id"].ToString(),
                                Longitude = ((Dictionary<string, object>) s["geometry"])?["coordinates"] != null ? ((s["geometry"] as Dictionary<string, object>)["coordinates"] as ArrayList).ToList<object>().First().ToString() : null,
                                Latitude = ((Dictionary<string, object>) s["geometry"]) == null ? null : ((s["geometry"] as Dictionary<string, object>)["coordinates"] as ArrayList).ToList<object>().Skip(1).First().ToString(),
                                ElevationInMeters = ((Dictionary<string, object>) ((Dictionary<string, object>) s["properties"])["elevation"])["value"].ToString(),
                                WXSite = ((Dictionary<string, object>) s["properties"])["stationIdentifier"].ToString(),
                                Site = ((Dictionary<string, object>) s["properties"])["stationIdentifier"].ToString().Substring(1),
                                FullName = ((Dictionary<string, object>) s["properties"])["name"].ToString(),
                                TimeZoneCity = ((Dictionary<string, object>) s["properties"])["timeZone"].ToString()


                            })
                        ;

                    return graph;
                }
                return null;
            }
        }


        static async Task<WeatherObservation> CurrentWeatherXML(string site)
        {
            System.Net.Http.HttpClient cons = new HttpClient();
            cons.DefaultRequestHeaders.Accept.Clear();
            cons.DefaultRequestHeaders.Add("User-Agent", "JBT iOPS");
            cons.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/vnd.noaa.obs+xml"));
            using (cons)
            {
                HttpResponseMessage res = await cons.GetAsync("https://api.weather.gov/stations/K" + site + "/observations/current");
                res.EnsureSuccessStatusCode();
                if (res.IsSuccessStatusCode)
                {
                    var result = await res.Content.ReadAsStringAsync();
                    //result.Dump("Raw Weather");
                    XElement po = XElement.Parse(result);

                    var graphList =
                            po.Elements()
                                .Select(e => new {
                                    name = e.Name.ToString(),
                                    value = e.Value
                                })
                                .Where(e => e.name != "credit")
                                .Where(e => e.name != "credit_URL")
                                .Where(e => e.name != "image")
                                .Where(e => e.name != "suggested_pickup")
                                .Where(e => e.name != "suggested_pickup_period")
                                .Where(e => e.name != "observation_time")
                                .Where(e => e.name.IndexOf("string", StringComparison.Ordinal) < 0)
                                .Where(e => e.name.IndexOf("url", StringComparison.Ordinal) < 0)
                                .ToList()
                        ;

                    var graph = new WeatherObservation
                    {
                        FullName = graphList.FirstOrDefault(l => l.name == "location")?.value,
                        StationId = graphList.FirstOrDefault(l => l.name == "station_id")?.value,
                        Latitude = graphList.FirstOrDefault(l => l.name == "latitude")?.value,
                        Longitude = graphList.FirstOrDefault(l => l.name == "longitude")?.value,
                        DateTime = graphList.FirstOrDefault(l => l.name == "observation_time_rfc822")?.value,
                        WeatherDescription = graphList.FirstOrDefault(l => l.name == "weather")?.value,
                        TemperatureFahrenheit = graphList.FirstOrDefault(l => l.name == "temp_f")?.value,
                        Humidity = graphList.FirstOrDefault(l => l.name == "relative_humidity")?.value,
                        WindDegrees = graphList.FirstOrDefault(l => l.name == "wind_degrees")?.value,
                        WindSpeedMPH = graphList.FirstOrDefault(l => l.name == "wind_mph")?.value,
                        PressureMillibars = graphList.FirstOrDefault(l => l.name == "pressure_mb")?.value,
                        DewpointFahrenheit = graphList.FirstOrDefault(l => l.name == "dewpoint_f")?.value,
                        HeatIndexFahrenheit = graphList.FirstOrDefault(l => l.name == "heat_index_f")?.value,
                        VisibilityMiles = graphList.FirstOrDefault(l => l.name == "visibility_mi")?.value
                    };

                    return graph;
                }
                return null; //The call was not successful
            }
        }



        public class WeatherObservation
        {
            public string FullName { get; set; }
            public string StationId { get; set; }
            public string Latitude { get; set; }
            public string Longitude { get; set; }
            public string DateTime { get; set; }
            public string WeatherDescription { get; set; }
            public string TemperatureFahrenheit { get; set; }
            public string Humidity { get; set; }
            public string WindDegrees { get; set; }
            public string WindSpeedMPH { get; set; }
            public string PressureMillibars { get; set; }
            public string DewpointFahrenheit { get; set; }
            public string HeatIndexFahrenheit { get; set; }
            public string VisibilityMiles { get; set; }

           
        }
        public class station
        {
            public string Site { get; set; }
            public string WXSite { get; set; }
            public string URL { get; set; }
            public string Longitude { get; set; }
            public string Latitude { get; set; }
            public string ElevationInMeters { get; set; }
            public string FullName { get; set; }
            public string TimeZoneCity { get; set; }
        }


    }

    static class Extensions
    {
        /// <summary>
        /// Convert ArrayList to List.
        /// </summary>
        public static List<T> ToList<T>(this ArrayList arrayList)
        {
            List<T> list = new List<T>(arrayList.Count);
            foreach (T instance in arrayList)
            {
                list.Add(instance);
            }
            return list;
        }
    }

}
