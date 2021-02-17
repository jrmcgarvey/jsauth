let user = null;
const domain = "https://auth-rails-psql.herokuapp.com";
const cookieName = "token";
let maindiv = null;
let token = null;

const getTokenFromCookie = () => {
  const name = cookieName + "=";
  const cookieString = decodeURIComponent(document.cookie);
  const cookieArray = cookieString.split(';');
  for (let i=0; i<cookieArray.length; i++) {
    let c = cookieArray[i];
    while (c[0] === ' ') {
      c = c.substring[1];
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length,c.length);
    }
  }
  return null;
}

const putTokenInCookie = (auth) => {
  var d = new Date();
  d.setTime(d.getTime() + (24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cookieName + "=" + auth + ";" + expires + ";path=/";
}

const setCurrentUser = () => {
  if (token) {
    fetch(`${domain}/current_user`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      }
    })
    .then(response => {
      response.json().then(data => {
        console.log(response.status,response.statusText,JSON.stringify(data));
        if (response.status === 200) {
          if (!data.error) {
            user=data.user;
          } else {
            alert(JSON.stringify(data));
          }
          maindiv.dispatchEvent(new CustomEvent('populate'));
        } else {
          alert(`Return from fetch current user ${response.status}:
            ${response.statusText} ${JSON.stringify(data)}`);
        }
        maindiv.dispatchEvent(new CustomEvent('populate'));
      });
    }).catch(console.error);
  } else {
    maindiv.dispatchEvent(new CustomEvent('populate'));
  }
};

const handleSubmitLogin = (event) => {
  event.preventDefault();
  let loginEmail=document.getElementById('loginEmail');
  let loginPassword=document.getElementById('loginPassword');
  fetch(`${domain}/login`, {
    method: "POST",
    credentials: 'include',
    mode: 'cors',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: loginEmail.value,
      password: loginPassword.value
    })
  })
  .then(response => {
    response.json().then(data => {
      console.log(response.status,response.statusText,JSON.stringify(data));
      if (response.status === 200) {
        token = response.headers.get("authorization")
        putTokenInCookie(token);
        setCurrentUser();
      } else {
        alert(`Return from signin ${response.status}: ${response.statusText} ${JSON.stringify(data)}`);
      }
    });
  }).catch(console.error);
};

const handleSubmitSignUp = (event) => {
  event.preventDefault();
  let signUpEmail=document.getElementById('signUpEmail');
  let signUpPassword=document.getElementById('signUpPassword');
  let signUpPasswordConfirmation=document.getElementById('signUpPasswordConfirmation');
  fetch(`${domain}/signup`, {
    method: "POST",
    credentials: 'include',
    mode: 'cors',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: signUpEmail.value,
      password: signUpPassword.value,
      password_confirmation: signUpPasswordConfirmation.value
    })
  })
  .then(response => {
    response.json().then(data => {
      console.log(response.status,response.statusText,JSON.stringify(data));
      if (response.status === 201) {
        token = response.headers.get("authorization")
        putTokenInCookie(token);
        setCurrentUser();
      } else {
        alert(`Return from signup ${response.status}: ${response.statusText} ${JSON.stringify(data)}`);
      }
    });
  }).catch(console.error);
};

document.addEventListener('DOMContentLoaded', (ev) => {
  token = getTokenFromCookie();
  maindiv = document.getElementById('maindiv');
  maindiv.addEventListener('populate',(ev) =>{
    if (user === null) {
      maindiv.textContent = '';
      maindiv.innerHTML =`
      <div>
        <h2>Sign In</h2>
        <form id="signInForm">
          <label>Email</label>
          <input
            type="email"
            name="loginEmail"
            id="loginEmail"
          />
          <label>Password</label>
          <input
            type="password"
            name="loginPassword"
            id="loginPassword"
          />
          <input type="submit"/>
        </form>

        <h2>Sign Up</h2>
        <form id="signUpForm">
          <label>Email</label>
          <input
            type="email"
            name="signUpEmail"
            id="signUpEmail"
          />
          <label>Password</label>
          <input
            type="password"
            name="signUpPassword"
            id="signUpPassword"
          />
          <label>Password Confirmation</label>
          <input
            type="password"
            name="signUpPasswordConfirmation"
            id="signUpPasswordConfirmation"
          />
          <input type="submit"/>
        </form>
      </div>`
      let signInForm = document.getElementById("signInForm");
      let signUpForm = document.getElementById("signUpForm");
      signInForm.addEventListener('submit', (ev) => {
        handleSubmitLogin(ev)
      });
      signUpForm.addEventListener('submit', (ev) => {
        handleSubmitSignUp(ev)
      });
    } else {
      maindiv.textContent='';
      maindiv.innerHTML = `<button id="signOut">Sign Out
      </button>
      <p>Hello ${ user.email }</p>`
      signOut=document.getElementById('signOut');
      signOut.addEventListener('click',(ev) =>{
        token=null;
        user=null;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        maindiv.dispatchEvent(new CustomEvent('populate'));
      });
    }
  });
  setCurrentUser();
});
