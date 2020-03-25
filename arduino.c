
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const char *ssid = "sid-24Ghz";
const char *password = "isyourm0mgay?";

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.begin();
  Serial.begin(115200);
  delay(1000);
  lcd.clear();
  lcd.print("Connecting");
  lcd.setCursor(0, 1);
  lcd.print("to WiFi..");
  Serial.begin(115200);
  WiFi.mode(WIFI_OFF);
  delay(1000);
  WiFi.mode(WIFI_STA);

  WiFi.begin(ssid, password);
  Serial.println("");

  Serial.print("Connecting");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  lcd.setCursor(0, 0);
  lcd.print("WiFi Connected!");
  lcd.setCursor(0, 1);
  lcd.print("IP: ");
  lcd.setCursor(4, 1);
  lcd.print(WiFi.localIP());
  delay(2500);

}


void loop() {
  for (;;) {
    String payload = getData();

    if (payload == "0") {

      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Error getting");
      lcd.setCursor(0, 1);
      lcd.print("10.0.0.120:5000");
      delay(5500);
      continue;

    }

    const char* charpay = payload.c_str();

    DynamicJsonDocument doc(1024);
    deserializeJson(doc, charpay);



    String all_cases = doc["countries"][0]["Worldwide"]["cases"];
    String all_deaths = doc["countries"][0]["Worldwide"]["deaths"];
    String all_recovered = doc["countries"][0]["Worldwide"]["recovered"];
    

    String china_cases = doc["countries"][1]["China"]["cases"];
    String china_deaths = doc["countries"][1]["China"]["deaths"];
    String china_recovered = doc["countries"][1]["China"]["recovered"];

    String italy_cases = doc["countries"][2]["Italy"]["cases"];
    String italy_deaths = doc["countries"][2]["Italy"]["deaths"];
    String italy_recovered = doc["countries"][2]["Italy"]["recovered"];



    String usa_cases = doc["countries"][3]["United States"]["cases"];
    String usa_deaths = doc["countries"][3]["United States"]["deaths"];
    String usa_recovered = doc["countries"][3]["United States"]["recovered"];

    String india_cases = doc["countries"][4]["India"]["cases"];
    String india_deaths = doc["countries"][4]["India"]["deaths"];
    String india_recovered = doc["countries"][4]["India"]["recovered"];

 

    setDis("Global", all_cases, all_deaths, all_recovered);
    setDis("China", china_cases, china_deaths, china_recovered);
    setDis("Italy", italy_cases, italy_deaths, italy_recovered);
    setDis("USA", usa_cases, usa_deaths, usa_recovered);
    setDis("India", india_cases, india_deaths, india_recovered);
   
  }


}

void setDis(String country, String cases, String deaths, String recovered) {

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(country + " Cases:");
  lcd.setCursor(0, 1);
  lcd.print(cases);
  delay(4000);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(country + " Deaths:");
  lcd.setCursor(0, 1);
  lcd.print(deaths);
  delay(4000);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(country + " Recovered:");
  lcd.setCursor(0, 1);
  lcd.print(recovered);
  delay(4000);



}

String getData() {
  HTTPClient http;
  String Link = "http://10.0.0.120:5000/esp";
  http.begin(Link);
  int httpCode = http.GET();
  String payload = http.getString();
  Serial.println(httpCode);
  Serial.println(payload);
  http.end();
  if (httpCode != 200) {
    Serial.println("error getting data");
    return "0";
  }
  return payload;
}
