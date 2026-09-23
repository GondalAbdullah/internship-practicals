1. You enter a url in a browser. the url consists of a protocol, the domain, the top level domain, query parameters etc.

2. DNS resolution happens and the domain is linked to it's assigned IP address

3. TCP connection happens via the three-way-handshake(SYN-SYN/ACK-ACK)

4. TLS handshake happens between the client and the server to exchange certificates, tls version, cipher suite and keys.

5. the connection is established and the request is send to the server

6. A reverse proxy or a load balancer intercepts the request and sends it to the required service.

7. Requests goes through a series of middleswares(auth, crsf etc)

8. The service deals with the request, gets the required data from the database, binds in to the response, jsonifies it and sends it back to the client

9. Client intercepts the response, checks the status code and continues this cycle again.