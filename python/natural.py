#!/usr/bin/env python
import sys
import re
from nltk import word_tokenize

# Get raw text data
ml = sys.argv[1]
cv = sys.argv[2]
rf = sys.argv[3]

# Output
print(word_tokenize(ml))