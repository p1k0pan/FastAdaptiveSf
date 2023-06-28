import jwt

from datetime import datetime, timedelta

KEY = "aDaPtIvE_sToRyFiNdEr_23"
ALGORITHM = "HS256"
REFRESH_ACESS_MINUTE = 20


def create_token(user_name:str, minute:int):
    expiration = datetime.utcnow() + timedelta(minutes=minute)
    payload  ={"user_name":user_name, "exp": expiration}

    encoded = jwt.encode(payload, KEY, algorithm=ALGORITHM)

    # result = {"usaer_name": user.user_name, "header": request.headers['authorization']}
    return encoded

def token_validation(token:str, refresh=False):
    try:
        # Verify the token's signature
        payload = jwt.decode(token, KEY, algorithms = [ALGORITHM])

        if refresh:
            # Token is valid, generate new one
            return ["Ok", '201', "Token is refreshed", payload["user_name"]]
        else:
            return ["Ok", '200', "Token is valid", payload["user_name"]]


    except jwt.ExpiredSignatureError as e:
        # Signature verification failed

        unverified_data = jwt.decode(token, KEY, algorithms = [ALGORITHM],options={"verify_signature": False})

        current_time = datetime.utcnow()
        expiration_time = datetime.fromtimestamp(unverified_data["exp"])

        if refresh:
            if current_time > expiration_time:
                # refresh Token has expired
                return ['Failed',"400", 'Signature verification failed. Token has expired. Login agian', None]
            else:
                # pass the access token instead of refresh token
                return ['Failed',"400", 'Please pass the refresh token', None]

        else:
            buffer_time = timedelta(minutes=REFRESH_ACESS_MINUTE)

            # Token has expired
            if current_time - expiration_time < buffer_time:
                # in refresh time
                return ["Failed", '401', "Token can be refresh", None]
            else:
                # not in refresh time
                return ['Failed',"400", 'Signature verification failed. Token has expired. Login agian', None]
    except jwt.InvalidSignatureError as e:
        # Signature verification failed
        print(e)
        return ['Failed', '404', 'Signature verification failed. Token is invalid.', None]
    except jwt.DecodeError as e:
        # Token decoding failed
        print(e)
        return ['Failed', '500', 'Token decoding failed. Token is invalid.', None]
    except:
        print(token)
        return ['Failed', '500', 'Unknown', None]
