    #include <SPI.h>
    #include <LoRa.h>
    #include <DHT.h>
    #include <LowPower.h>
    #include <avr/wdt.h>
    #include <avr/sleep.h>
    #include <avr/power.h>
    
    /**
    Slave 1 power pin A5
    dht21 7
    moisiture A2*/

    /**
    Slave 2 power pin A3
    dht11 7
    moisiture A2*/

    #define DHTPIN 7          //pin where the dht11 is connected
    int hd1=0;
    int hd2=0;
    unsigned int hdv1=0;
    unsigned int hdv2=0;
    float h;
    float t;

    #define HUM1 A2
    #define POWER A3



    int counter = 0;

    DHT dht(DHTPIN, DHT21);


    void setup() 

    {
    Serial.begin(115200);
    pinMode(A3, OUTPUT);
    // watchdogSetup();
    
    //LoRa.setPins(10,8,2);
    pinMode(HUM1,INPUT);
    //  pinMode(HUM2,INPUT);

    
    dht.begin();
    
    }
    void Lora(){
    while (!Serial);
    Serial.println("LoRa Sender");
    
        if (!LoRa.begin(433E6)) {
        Serial.println("Starting LoRa failed!");
        delay(100);
        while (1);
        }
    }

    void dht11(){
    delay(2000);
    
    h = dht.readHumidity();
    t = dht.readTemperature();
    if (isnan(h) || isnan(t)) 
    {
    Serial.println("Failed to read from DHT sensor!");
    return;
    }
    Serial.print("Temperature:    ");
    Serial.print(t);
    Serial.println("degrees Celcius");
    Serial.print("Air Humidity:    ");
    Serial.print(h);
    Serial.println("%");
    
    
    }

    void Moisiture(){

    delay(100);
    hdv1=analogRead(HUM1);
    //  hdv2=analogRead(HUM2);
    hd1 = map(hdv1,0,1023,0,100); // To display the soil moisture value in percentage
    // hd2 = map(hdv2,0,1023,0,100);
    
    
    Serial.print("Soil Moisiture 1 : ");
    Serial.print(hdv1);
    Serial.print("    Moisiture Percentage ");
    Serial.print(hd1);
    Serial.println(" %");

    //   Serial.print("Soil Moisiture 2 : ");
    //  Serial.print(hdv2);
    //  Serial.print("    Moisiture Percentage ");
    //  Serial.print(hd2);
    //   Serial.println(" %");
    }
    void loop() 
    { 
    //   PORTD |= (1<<PD7);  // equals (roughly) digitalWrite(7, LOW);
    digitalWrite(A3, HIGH);
        Serial.println(F("Reading. . . . . . ."));
    delay(2000);
    Lora();
    dht11();
    Moisiture();
        
    

    //  
    //
    
    

    ////  Serial.print("Sending packet: ");
    ////  Serial.println(counter);
    //// 
    //  

    
    // send packet
    LoRa.beginPacket();
    LoRa.print(t);
    LoRa.print("*");
    LoRa.print(h);
    LoRa.print("*");
    LoRa.print(hd1);
    LoRa.print("*");
    LoRa.print(hdv1);
    LoRa.print("*");
    LoRa.print("S1");
    //LoRa.print("*");
    //LoRa.println(hdv2);


    delay(5000);
    LoRa.endPacket();


                    
    //  counter++;





        }