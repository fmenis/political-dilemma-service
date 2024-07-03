import axios from 'axios'
import S from 'fluent-json-schema'
import Ajv from 'ajv'

//##TODO farlo diventare un plugin per poter avere accesso a pino

const ajv = new Ajv({
  allErrors: true,
})

const GEOLOCATION_API_URL = 'https://ipapi.co/'

const validate = compileValidateFn()

export async function getGeolocationData(ip) {
  //##TODO implement retry strategy
  const { data } = await axios({
    method: 'GET',
    baseURL: GEOLOCATION_API_URL,
    url: `/${ip}/json`,
  })

  //##TODO implement error handling

  const valid = validate(data)
  if (!valid) {
    console.log(validate.errors)
    throw new Error('Geolocation response object validation failed')
  }

  return {
    ip: data.ip,
    version: data.version,
    city: data.city,
    region: data.region,
    countryName: data.country_name,
    inEu: data.in_eu,
    continentCode: data.continent_code,
    countryName: data.country_name,
    latitude: data.latitude,
    longitude: data.longitude,
  }
}

function compileValidateFn() {
  const schema = S.object()
    .additionalProperties(true)
    .prop('ip', S.string().minLength(3).maxLength(50))
    .description('Ip address.')
    .required()
    .prop('version', S.string().minLength(4).maxLength(4))
    .description('Ip version.')
    .required()
    .prop('city', S.string().minLength(2).maxLength(50))
    .description('City name.')
    .required()
    .prop('region', S.string().minLength(2).maxLength(100))
    .description('Region name.')
    .required()
    .prop('country_name', S.string().minLength(2).maxLength(100))
    .description('Country name.')
    .required()
    .prop('in_eu', S.boolean())
    .description('Defines if  the county is in Europe.')
    .required()
    .prop('continent_code', S.string().minLength(2).maxLength(10))
    .description('Continent code.')
    .required()
    .prop('latitude', S.number())
    .description('Latitude.')
    .required()
    .prop('longitude', S.number())
    .description('Longitude.')
    .required()

  const jsonSchema = schema.valueOf()

  return ajv.compile(jsonSchema)
}

getGeolocationData('151.49.224.1')
  .then(res => console.log(res))
  .catch(err => console.error(err))
