# ShopKart Customer Authentication Service

An Express and MongoDB authentication backend built in the MVC structure required by the lab.

## Open and run in VS Code

1. Open this `shopkart-auth-backend` folder in VS Code.
2. Ensure MongoDB is running locally, or replace `MONGODB_URI` in `.env` with your MongoDB Atlas connection string.
3. Open the integrated terminal and run `npm install`.
4. Run `npm run dev`, or select **Run and Debug** → **Run ShopKart API**.
5. Test using Postman. Alternatively, install the VS Code **REST Client** extension and run the requests in `shopkart.http`.

The API runs at `http://localhost:5000`.

## Endpoints

| Method | Endpoint | Protected | Purpose |
| --- | --- | --- | --- |
| POST | `/customers/register` | No | Create an account |
| POST | `/customers/login` | No | Set the JWT HttpOnly cookie |
| GET | `/customers/me` | Yes | Get current customer |
| POST | `/customers/logout` | Yes | Clear cookie |
| PATCH | `/customers/change-password` | Yes | Bonus task |

Passwords are bcrypt hashes in MongoDB, excluded from queries by default, and never returned in API responses. Change `JWT_SECRET` before any deployment. `.env` is excluded from git; `.env.example` is the safe template.
