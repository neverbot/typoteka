-- Remove empty paragraphs containing only anchor spans
-- These are created from markdown like []{#anchor-id} and can cause 
-- PagedJS overflow issues

function Para(para)
    -- Check if paragraph contains only empty spans or links with no text content
    if #para.content == 1 then
        local element = para.content[1]
        
        -- Check for empty span with only attributes (id, class, etc.) but no content
        if element.t == "Span" and #element.content == 0 then
            return {} -- Remove this paragraph
        end
        
        -- Check for empty link
        if element.t == "Link" and #element.content == 0 then
            return {} -- Remove this paragraph
        end
    end
    
    -- Check for completely empty paragraphs
    if #para.content == 0 then
        return {} -- Remove this paragraph
    end
    
    return para
end

-- Also handle empty spans at block level
function Div(div)
    -- If div contains only empty paragraphs, we might want to preserve it
    -- but clean up its content
    return div
end
