
### Description 
Fine-Tune T5-small for Natural Language translation to MongoDB Query 

### Objective
Develop a system capable of translating natural language queries (NLQ) into MongoDB queries by fine-tuning a small sequence-to-sequence model (T5-small) on a dataset of NLQ and MongoDB query pairs. The system should be capable of understanding and generating and executing MongoDB queries based on user input in natural language. The output should be viewable in a web application, allowing users to input their queries (NLQ) and receive the executed MongoDB query results in a user-friendly format.

### Processs
**1. Problem definition** 
Explore the problem of translating natural language into MongoDB queries by fine-tunning a model on a dataset built based on an existing [MongoDB database](mongo_db). Initial focus is on simple `find` queries for specific db collections (`users`, `bookings`).

