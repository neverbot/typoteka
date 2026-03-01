-- Fix invalid header hierarchy
-- This filter ensures proper header nesting by adjusting header levels
-- to maintain proper hierarchical order

local previous_level = 0

function Pandoc(doc)
    -- Reset for each document
    previous_level = 0
    
    -- Walk through all blocks and fix header levels
    local function fix_headers(blocks)
        for i, block in ipairs(blocks) do
            if block.t == "Header" then
                local current_level = block.level
                
                -- If current level jumps more than one level from previous,
                -- adjust it to be previous + 1. Do not change the first header
                -- (when previous_level == 0) so that ## stays h2 if the author chose it.
                if previous_level > 0 and current_level > previous_level + 1 then
                    block.level = previous_level + 1
                end
                
                previous_level = block.level
            end
        end
        return blocks
    end
    
    doc.blocks = fix_headers(doc.blocks)
    return doc
end
