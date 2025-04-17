
### Description 
Fine-Tune a sequence-to-sequence model for Natural Language translation to MongoDB Query 

### Objective
Develop a system capable of translating natural language queries (NLQ) into MongoDB queries (MLQ) by fine-tuning a sequence-to-sequence model on a dataset of NLQ and MLQ pairs. The system should be capable of understanding, generating and executing MongoDB queries based on user input in natural language. The output should be viewable in a web application, allowing users to input their queries (NLQ) and receive the executed MongoDB query results in a user-friendly format.

### Processs
1. **Problem definition**  
Explore the problem of translating natural language into MongoDB queries by fine-tunning a model on a dataset built based on an existing [MongoDB database](mongo_db). Initial focus is on simple `find` queries for specific db collections (`users`, `bookings`).  

2. **Model Selection**    
Initially chose the 80M params [FLAN-T5-small](https://huggingface.co/google/flan-t5-small) model however during inference is was generating incorrect outputs, due to ommitting some symbols (see Data Preparation -> linear format).  
***Research paper for Flan**: https://arxiv.org/pdf/2210.11416*  
Finally chose the 60M params [T5-small](https://huggingface.co/google-t5/t5-small) model due to doing better at input -> target text generation. And the target text is a MongoDB query in linear format (more below about the linear format).  
***Research paper for T5**: https://jmlr.org/papers/volume21/20-074/20-074.pdf*  

3. **Data Preparation**  
    - The initial target MongoDB query (MLQ) structure was defined in json format as
        ```json
        {
            "c":"users", //collection name
            "op":"find", //query operation - find only for now
            "q": { //query filter
                "country": "Canada",
                "stats.totalCreditsBought": {
                    "$gt": 1000.0
                }
            }
        }
        ```
        However, the nested JSON structure proved to be troublesome for the model to learn. Especially because the model tokenizer was representing the curly brackets (`{}`) as <unk> tokens.
    - Solution: Instead of JSON structure adopt a novel linearized (flattened) format using distinct markers to represent symbols e.g.  

        | Symbol  | Marker |
        | ------------- | ------------- |
        | {  | LCB  |
        | }  | RCB  |
        | [  | LB   |
        | ]  | RB   |
        | :  | =    |
        | ,  | use `&` for query filters and use `;` for instructions separations `c,op,q`  |
        | &  | OP_ |
        So the above example would be represented as:
        ```
        c=users; op=find; q=LCB country=Canada & stats.totalCreditsBought= LCB OP_$gt=1000.0 RCB RCB
        ```
    - The created [dataset](ml/nlq2mlq_find_op_data_1138_linearized.json) 1000+ examples of NLQ and MLQ pairs focusing only on find operations
    - In the [dataset](ml/nlq2mlq_find_op_data_1138_linearized.json) were included various mongodb queries with filters like equality, numeric comparisons(`&gt`,`&lt`), set comparisons (`$in`) and last but not least multi-condition queries. 


