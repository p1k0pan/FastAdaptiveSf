import jwt

from datetime import datetime, timedelta, timezone

KEY = "aDaPtIvE_sToRyFiNdEr_23"
ALGORITHM = "HS256"
REFRESH_ACESS_MINUTE = 20


def create_token(user_name:str, minute:int):
    # exp=datetime.now(tz=timezone.utc) + timedelta(minutes=minute) # add timezone for jwt decode correctly
    exp=datetime.now() + timedelta(minutes=minute) # add timezone for jwt decode correctly
    payload  ={"user_name":user_name, "exp": exp.timestamp()}
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

        current_time = datetime.now()
        expiration_time = datetime.fromtimestamp(unverified_data["exp"])
        diff = (current_time.timestamp()- expiration_time.timestamp()) / 60

        if refresh:
            if diff>0:
                # refresh Token has expired
                return ['Failed',"402", 'Signature verification failed. Token has expired. Login agian or pass the refresh token', None]
            else:
                current_time_str = current_time.strftime("%Y-%m-%d %H:%M:%S")
                expiration_time_str = expiration_time.strftime("%Y-%m-%d %H:%M:%S")

                print(diff)
                print("Current Time:", current_time_str, current_time.timestamp())
                print("Expiration Time:", expiration_time_str, expiration_time.timestamp())
                # pass the access token instead of refresh token
                return ['Failed',"409", 'should be success', None]
                # return ["Ok", '201', "Token is refreshed", unverified_data["user_name"]]

        else:

            # Token has expired
            if diff < REFRESH_ACESS_MINUTE:
                # in refresh time
                return ["Failed", '401', "Token can be refresh", unverified_data["user_name"]]
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
