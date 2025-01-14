import { Component, OnInit, Input, NgZone, ChangeDetectorRef } from '@angular/core';
import { NgxKeyboardEventsService, NgxKeyboardEvent } from 'ngx-keyboard-events';
import { ActivatedRoute } from '@angular/router';
import { StoryblokService } from '../storyblok.service';
import { Router } from '@angular/router';


export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  
  constructor(private route: ActivatedRoute, private productData: StoryblokService,  
              private zone: NgZone, private router: Router, 
              private keyListen: NgxKeyboardEventsService, private changeDetector: ChangeDetectorRef) {}

  @Input() input: string;

  products: any = [];

  textArr = [];

  ngOnInit() {
      // CMS DATA CONNECTION
      this.productData.getStory('/', {version: 'draft', starts_with: 'men/'})
      .then(data => {
        this.products = data.stories;    
        this.products.forEach((product) => {
          this.textArr.push(`${product.content.title}, It's price ${product.content.price} Dollar ...`);
        });
      });

      // TEXT TO SPEECH      
        const intro = `To listen to available products. ...
                       Please press "Control", and say "Read". ... ....
                       To select an item. ...
                       Press "Control", and then say the "Product Name". ...`
        const textSpeech = () => {
            const msg = new SpeechSynthesisUtterance();
            msg.rate = 1.0;
            msg.text  = intro;
            msg.lang = 'en-US';
            speechSynthesis.speak(msg);
        } 
        setTimeout(textSpeech, 500)
 
      const sayText = () => {
        const textSpeech = () => {
          const msg = new SpeechSynthesisUtterance();
          msg.text  = `${this.textArr}`;
          msg.lang = 'en-US';
          speechSynthesis.speak(msg);
        }
        setTimeout(textSpeech, 500)
      };
  

      // FUNCTIONS TO NAVIGATE PAGES
      const goHome = () => {
        this.zone.run(() => this.router.navigateByUrl('/'))
        recognition.stop()
      }
  
      const goToCart = () => {
        this.zone.run(() => this.router.navigateByUrl('/cart'))
        recognition.stop()
      }

      const playAudio = () => {
        let audio = new Audio();
        audio.src = "./assets/bleep.wav";
        audio.load();
        audio.volume = 0.1;
        audio.play();
      }

      // KEYBOARD CONTROL
      let keyPressed = false;
      this.keyListen.onKeyPressed.subscribe((keyEvent: NgxKeyboardEvent) => {
        if(keyPressed === false && keyEvent.code === 17){
          speechSynthesis.cancel();
          recognition.start();
          playAudio();
          keyPressed = true;
          setTimeout(checkKeyPressed, 10000);
        }
      });

      function checkKeyPressed(){
        return keyPressed = false;
      }

      // TO FILTER PRODUCT BY COMMAND
      const filterProduct = (cmd: string)=>{
        const cmdLower = cmd.toLowerCase();
        this.products.filter(product=>{   
          const titleLower = product.content.title.toLowerCase();  
           if(titleLower === cmdLower || titleLower.startsWith(cmdLower)){
             this.zone.run(() => this.router.navigate(['/products', product.id], { relativeTo: this.route }));
             recognition.stop();
             checkKeyPressed();
           };
         })
       }

  
      // SPEECH TO TEXT    
      const {webkitSpeechRecognition} : IWindow = <IWindow>window;
      const recognition = new webkitSpeechRecognition();
      var SpeechGrammarList = SpeechGrammarList ||window['webkitSpeechGrammarList'];
      
      var grammar = '#JSGF V1.0;'
      var speechRecognitionList = new SpeechGrammarList();
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = function(event) {
          let last = event.results.length - 1;
          let command = event.results[last][0].transcript;
          console.log(command);               
          filterProduct(command);

          if(command.toLowerCase() === 'cart'){  
            goToCart();
          }else if(command.toLowerCase() === 'home'){  
            goHome();
          }else if(command.toLowerCase() === 'read'){
            sayText();            
          }
        
      };
      recognition.onspeechend = function() {
          recognition.stop();
      };
      recognition.onerror = function(event) {
        console.log(event.error);
      }        
  }
  // END ngOnInit



}