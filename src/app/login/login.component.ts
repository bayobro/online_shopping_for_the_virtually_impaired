import { Component, OnInit, NgZone, Input } from '@angular/core';
import { NgxKeyboardEventsService, NgxKeyboardEvent } from 'ngx-keyboard-events';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Input()
  email: string;
  password: string;
  invalidForm: boolean;

  constructor(public router: Router, private zone: NgZone, 
              private keyListen: NgxKeyboardEventsService, private serve: AuthService) { }


  // FUNCTION TO LOGIN
  login() {
    this.serve.login(this.email, this.password)
  }

  ngOnInit() { 
    // TO FOCUS EMAIL INPUT & TO HIDE PASS INPUT
    document.getElementById("email").focus();
    document.getElementById("pass-input").style.display = "none";  
    
    // LOG IN PAGE VOICE TEXT
    const logText = () => {
      const msg = new SpeechSynthesisUtterance();  
      msg.rate = 0.8;
      msg.pitch = 0.5; 
      msg.text =  `You are in Signin page. ...
                  If you are not registered yet. ..., 
                  Please Register first. ...
                  To get the register form. ...
                  Plese press "Control" and say "Sign Up". ...`
      speechSynthesis.speak(msg)
      const emailText = () => {
        const msg = new SpeechSynthesisUtterance();    
        msg.text = `To login, If you want facial authentication, Press "Control" and say "face" 
        else, Please write your email address and press "Enter" . ...
`
        speechSynthesis.speak(msg)
      }
      setTimeout(emailText, 3000);
  
    }
    setTimeout(logText, 1000);

    
    // VOICE TEXT TO FILL PASSWORD
    const passText = () => {
      const msg = new SpeechSynthesisUtterance();    
      msg.text = `Please write your password. ...
                  and then press "Ctrl" and say "Send" . ...`
      speechSynthesis.speak(msg)
      return;
    }
 
    // TO NAVIGATE TO REGiSTER PAGE
    const goRegister = () => {
      this.zone.run(() => this.router.navigateByUrl('/register'))
      speechSynthesis.cancel();
    }

    const playAudio = () => {
      let audio = new Audio();
      audio.src = "./assets/bleep.wav";
      audio.load();
      audio.volume = 0.1;
      audio.play();
    }
    // TO ACTIVE KEY CONTROL
    let keyPressed = false;
    this.keyListen.onKeyPressed.subscribe((keyEvent: NgxKeyboardEvent) => {
      if(keyEvent.code == 13){       
        document.getElementById("pass-input").style.display = "block";
        document.getElementById("password").focus();
        let v = setTimeout(passText, 500);
        if(this.invalidForm = true){
          v;          
        }else if(this.invalidForm = false){
          clearTimeout(v);
          speechSynthesis.cancel();
        }  
      }else if(keyEvent.code === 17) {
        speechSynthesis.cancel();
        recognition.start();
        playAudio();
        keyPressed = true;
        setTimeout(checkKeyPressed, 10000);
      }else if(keyEvent.code === 80){
        speechSynthesis.cancel();
      }else if(keyEvent.code === 18){
        recognition.stop();
      }
    });

    function checkKeyPressed(){
      return keyPressed = false;
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
    recognition.onresult = (event: any) => {
        let last = event.results.length - 1;
        let command = event.results[last][0].transcript;
        console.log(command);
        if(command.toLowerCase() == 'sign up'){
          goRegister();
        }else if(command.toLowerCase() == 'send'){
          this.login();
        }
        else if(command.toLowerCase() == 'face'){
          this.loginWithFacialRecognition();       
        }
    };
    recognition.onspeechend = () => {
        recognition.stop();
    };
    recognition.onerror = (event: any) => {
      console.log(event.error);
    }
  }



  loginWithFacialRecognition(){
    console.log("facial recognition login called")

    if(true){
      this.serve.login(this.email, this.password) // credenntials from facial recogition response
    }

  }
  

}
