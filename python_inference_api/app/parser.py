import re

def try_parse_number(value_str):
    value_str = value_str.strip()
    try:
        return int(value_str)
    except ValueError:
        try:
            return float(value_str)
        except ValueError:
            return value_str

def parse_linearized_query(linear_string):
    if not linear_string or not isinstance(linear_string, str):
        print("Parser Error: Input must be a non-empty string.")
        return None

    parsed_result = {'collection': None, 'operation': None, 'query': {}}
    query_dict = {}

    try:
        linear_string = linear_string.strip()
        parts = [p.strip() for p in linear_string.split(';')]

        for part in parts:
            if not part: continue
            match = re.match(r"^\s*([^=\s]+)\s*=\s*(.*)\s*$", part)
            if not match:
                print(f"Warning: Malformed part '{part}'. Skipping.")
                continue
            key, value = match.groups() 

            if key == 'c':
                parsed_result['collection'] = value
            elif key == 'op':
                parsed_result['operation'] = value
            elif key == 'q':
                q_part_value = value 

        if q_part_value.startswith('LCB') and q_part_value.endswith('RCB'):
            query_content = q_part_value[len('LCB'):-len('RCB')].strip()

            if query_content: 
                conditions = [cond.strip() for cond in query_content.split('&')]

                for cond in conditions:
                    if not cond: continue
                    cond_match = re.match(r"^\s*([^=\s]+)\s*=\s*(.*)\s*$", cond)
                    if not cond_match:
                        print(f"Warning: Malformed condition '{cond}'. Skipping.")
                        continue
                    field = cond_match.group(1)
                    val_part = cond_match.group(2)

                    if val_part.startswith('LCB') and val_part.endswith('RCB'):
                        op_content = val_part[len('LCB'):-len('RCB')].strip()
                        op_val_pair = op_content.split('=', 1)
                        if len(op_val_pair) != 2:
                            print(f"Warning: Malformed operator clause '{op_content}'. Skipping.")
                            continue
                        op_str, op_val_str = op_val_pair[0].strip(), op_val_pair[1].strip()

                        if not op_str.startswith('OP_'):
                             print(f"Warning: Invalid operator format '{op_str}'. Skipping.")
                             continue
                        mongo_op = f"${op_str[len('OP_'):]}" 

                        if mongo_op == '$in':
                            if not op_val_str.startswith('LB') or not op_val_str.endswith('RB'):
                                print(f"Warning: Malformed $in list '{op_val_str}'. Skipping.")
                                continue
                            list_content = op_val_str[len('LB'):-len('RB')].strip()
                            list_items = [try_parse_number(item.strip()) for item in list_content.split(',') if item.strip()]
                            query_dict[field] = {mongo_op: list_items}
                        else:
                            parsed_op_val = try_parse_number(op_val_str)
                            query_dict[field] = {mongo_op: parsed_op_val}
                    else:
                        parsed_val = try_parse_number(val_part)
                        query_dict[field] = parsed_val
        else:
             if q_part_value:
                  print(f"Warning: Query part missing LCB/RCB wrappers: '{q_part_value}'. Treating as empty.")

        parsed_result['query'] = query_dict

        if not parsed_result['collection'] or not parsed_result['operation']:
             print("Warning: Missing 'collection' or 'operation' after parsing.")
             return None 

        return parsed_result

    except Exception as e:
        print(f"Error parsing linearized string: {e}")
        print(f"Input string was: {linear_string}")
        return None