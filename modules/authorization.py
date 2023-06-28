import jwt

from datetime import datetime, timedelta

key = "aDaPtIvE_sToRyFiNdEr_23"
algorithm = "HS256"


def create_token(user_name:str):
    expiration = datetime.utcnow() + timedelta(hours=1)
    payload  ={"user_name":user_name, "exp": expiration}

    encoded = jwt.encode(payload, key, algorithm=algorithm)

    # result = {"usaer_name": user.user_name, "header": request.headers['authorization']}
    return encoded

def token_decode(token:str):
    try:
        # Verify the token's signature
        payload = jwt.decode(token, key, algorithms = [algorithm])

        # Check the token's expiration time
        current_time = datetime.utcnow()
        expiration_time = datetime.fromtimestamp(payload["exp"])

        if current_time > expiration_time:
            # Token has expired
            return ["Ok", '203', "Token is expired", None]
        else:
            # Token is valid
            return ["Ok", '200', "Token is valid", payload["user_name"]]

    except jwt.ExpiredSignatureError as e:
        # Signature verification failed
        print(e)
        return ['Failed',"400", 'Signature verification failed. Token has expired.', None]
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
